<template>
    <view class="camera-container">
        <!-- 相机视频流 -->
        <video 
            v-if="videoStream" 
            ref="videoRef"
            class="camera" 
            autoplay 
            playsinline
            :srcObject.prop="videoStream"
        ></video>

        <!-- AR 指示层 -->
        <view class="ar-overlay" v-if="videoStream && isNavigating">
            <!-- 当对准目标方向时显示标记 -->
            <view class="target-marker" v-if="isNearTarget">
                <text class="marker-symbol">⊕</text>
                <text class="marker-text">目标方向</text>
            </view>
            <!-- 当未对准目标时显示方向提示 -->
            <view v-else class="direction-hint">
                <text class="hint-arrow" :class="getArrowClass">{{ getArrowSymbol }}</text>
                <text class="hint-text">{{ getDirectionText }}</text>
            </view>
        </view>

        <!-- 调试信息 -->
        <view class="debug-info" v-if="debugMode">
            <text>方向支持: {{ hasDeviceOrientation ? '已启用' : '未启用' }}</text>
            <text>当前朝向: {{ Math.round(compassHeading) }}°</text>
            <text>目标方位: {{ targetDegree }}°</text>
            <text>方向差值: {{ Math.round(Math.abs(compassHeading - targetDegree)) }}°</text>
        </view>

        <!-- 顶部控制栏 -->
        <view class="top-bar">
            <view class="back-btn" @click="handleBack">
                <text class="back-icon">←</text>
            </view>
            <text class="title">AR导航</text>
        </view>

        <!-- 底部控制栏 -->
        <view class="bottom-bar">
            <view class="control-btn" @click="handleDirectionSelect" v-if="!showCompass && !isNavigating">
                <text class="btn-icon">🎯</text>
                <text class="btn-text">选择方向</text>
            </view>
            <view class="control-btn" v-if="hasDirection" @click="toggleNavigation">
                <text class="btn-icon">{{ isNavigating ? '⏹️' : '▶️' }}</text>
                <text class="btn-text">{{ isNavigating ? '停止导航' : '开始导航' }}</text>
            </view>
        </view>

        <!-- 错误提示 -->
        <uni-popup ref="popup" type="center">
            <view class="error-popup">
                <text class="error-title">提示</text>
                <text class="error-message">{{ errorMessage }}</text>
                <button class="error-btn" @click="closePopup">确定</button>
            </view>
        </uni-popup>

        <!-- 指南针选择界面 -->
        <view class="compass-overlay" v-if="showCompass">
            <view class="compass-container">
                <view class="compass-ring">
                    <view class="compass-pointer" :style="{ transform: `rotate(${compassHeading}deg)` }">
                        <text class="pointer-text">N</text>
                    </view>
                    <view class="target-pointer" :style="{ transform: `rotate(${tempTargetDegree}deg)` }">
                        <text class="target-arrow">⬆</text>
                    </view>
                </view>
                <view class="compass-controls">
                    <text class="degree-text">目标方向: {{ Math.round(tempTargetDegree) }}°</text>
                    <view class="direction-buttons">
                        <button class="direction-btn" @click="adjustDirection(-5)">←</button>
                        <button class="direction-btn" @click="adjustDirection(5)">→</button>
                    </view>
                    <view class="action-buttons">
                        <button class="cancel-btn" @click="cancelDirectionSelect">取消</button>
                        <button class="confirm-btn" @click="confirmDirection">确认方向</button>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 添加类型声明
declare global {
    interface Window {
        DeviceOrientationEvent: {
            requestPermission?: () => Promise<string>
        }
    }
}

const popup = ref()
const videoRef = ref()
const errorMessage = ref('')
const videoStream = ref<MediaStream | null>(null)
const isNavigating = ref(false)
const debugMode = ref(true)
const hasDeviceOrientation = ref(false)
const compassHeading = ref(0)
const targetDegree = ref(0)
const showCompass = ref(false)
const tempTargetDegree = ref(0)
const hasDirection = ref(false)

// 修改方向存储的键名，使其更具体
const DIRECTION_STORAGE_KEY = 'ar-target-direction'

// AR 导航相关状态
const destination = ref({ 
    latitude: 29.533155,  // 设置固定的目标位置
    longitude: 106.604423 
})

// 计算是否对准目标
const isNearTarget = computed(() => {
    const diff = Math.abs(compassHeading.value - targetDegree.value)
    return diff < 15 || diff > 345
})

// 获取旋转角度
const getRotationAngle = () => {
    const diff = targetDegree.value - compassHeading.value
    return ((diff + 360) % 360)
}

// 计算方向角度
const calculateBearing = (start: any, end: any) => {
    const startLat = start.latitude * Math.PI / 180
    const endLat = end.latitude * Math.PI / 180
    const dLon = (end.longitude - start.longitude) * Math.PI / 180

    const y = Math.sin(dLon) * Math.cos(endLat)
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon)
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI
    return (bearing + 360) % 360
}

// 更新AR指示器
const updateARIndicator = (position: GeolocationPosition) => {
    // 不再更新 targetDegree，保持用户设置的方向
    console.log('当前位置更新:', position.coords)
}

// 处理设备方向变化
const handleOrientation = (event: DeviceOrientationEvent) => {
    if (!isNavigating.value) return

    // iOS 设备
    if ('webkitCompassHeading' in event) {
        compassHeading.value = (event as any).webkitCompassHeading
        hasDeviceOrientation.value = true
    }
    // Android 设备
    else if (event.alpha !== null) {
        if (event.absolute) {
            compassHeading.value = 360 - event.alpha
        } else {
            compassHeading.value = 360 - event.alpha
        }
        hasDeviceOrientation.value = true
    }

    console.log('当前朝向:', compassHeading.value)
}

// 请求设备方向权限
const requestDevicePermission = async () => {
    try {
        if (typeof window.DeviceOrientationEvent?.requestPermission === 'function') {
            const permission = await window.DeviceOrientationEvent.requestPermission()
            if (permission === 'granted') {
                return true
            } else {
                showError('需要设备方向权限来提供AR导航')
                return false
            }
        }
        // 对于不需要请求权限的设备，直接返回 true
        return true
    } catch (error) {
        showError('获取设备方向权限失败，请确保在"设置-Safari-动作与陀螺仪传感器"中允许访问')
        return false
    }
}

// 启动相机和导航
const startTracking = async () => {
    try {
        // 启动相机
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    exact: 'environment'
                }
            }
        })
        videoStream.value = stream

        // 请求位置权限
        navigator.geolocation.watchPosition(
            updateARIndicator,
            (error) => showError('无法获取位置信息：' + error.message),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        )
    } catch (error: any) {
        showError('设备访问错误: ' + error.message)
    }
}

// 启动设备方向监听
const startDeviceOrientation = () => {
    if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation)
    } else {
        window.addEventListener('deviceorientation', handleOrientation)
    }
}

// 停止设备方向监听
const stopDeviceOrientation = () => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation)
    window.removeEventListener('deviceorientation', handleOrientation)
}

// 从存储中获取保存的方向
const getSavedDirection = () => {
    try {
        const savedDegree = uni.getStorageSync(DIRECTION_STORAGE_KEY)
        if (savedDegree !== '') {
            targetDegree.value = Number(savedDegree)
            hasDirection.value = true
            tempTargetDegree.value = targetDegree.value // 同步临时方向
        } else {
            // 使用默认方向
            targetDegree.value = 0
            tempTargetDegree.value = 0
            hasDirection.value = false
        }
    } catch (error) {
        console.error('获取保存的方向失败:', error)
        targetDegree.value = 0
        tempTargetDegree.value = 0
        hasDirection.value = false
    }
}

// 显示指南针选择界面
const handleDirectionSelect = () => {
    showCompass.value = true
    // 重置临时方向为0，而不是使用之前的方向
    tempTargetDegree.value = 0
    // 开始监听设备方向
    startDeviceOrientation()
}

// 调整临时目标方向
const adjustDirection = (delta: number) => {
    tempTargetDegree.value = (tempTargetDegree.value + delta + 360) % 360
}

// 确认选择的方向
const confirmDirection = () => {
    // 直接使用新的方向，覆盖之前的设置
    targetDegree.value = tempTargetDegree.value
    hasDirection.value = true
    
    // 保存到本地存储
    try {
        uni.setStorageSync(DIRECTION_STORAGE_KEY, targetDegree.value.toString())
        showCompass.value = false
        stopDeviceOrientation()
        uni.showToast({
            title: '方向已设置',
            icon: 'success'
        })
    } catch (error) {
        console.error('保存方向失败:', error)
        uni.showToast({
            title: '设置失败，请重试',
            icon: 'error'
        })
    }
}

// 取消方向选择
const cancelDirectionSelect = () => {
    showCompass.value = false
    stopDeviceOrientation()
}

// 修改 toggleNavigation 函数
const toggleNavigation = async () => {
    if (!hasDirection.value) {
        uni.showToast({
            title: '请先选择方向',
            icon: 'none'
        })
        return
    }

    if (!isNavigating.value) {
        const hasPermission = await requestDevicePermission()
        if (!hasPermission) return
    }

    isNavigating.value = !isNavigating.value
    
    if (isNavigating.value) {
        startDeviceOrientation()
        // 不需要立即获取位置，因为我们只使用用户设置的方向
        uni.showToast({
            title: '导航已开启',
            icon: 'success'
        })
    } else {
        stopDeviceOrientation()
        uni.showToast({
            title: '导航已停止',
            icon: 'none'
        })
    }
}

// 返回上一页
const handleBack = () => {
    uni.navigateBack()
}

// 显示错误信息
const showError = (message: string) => {
    errorMessage.value = message
    popup.value?.open()
}

// 关闭弹窗
const closePopup = () => {
    popup.value?.close()
}

// 获取箭头样式类
const getArrowClass = computed(() => {
    const diff = ((targetDegree.value - compassHeading.value + 360) % 360)
    if (diff <= 15 || diff >= 345) return 'arrow-straight'
    if (diff > 15 && diff < 180) return 'arrow-right'
    return 'arrow-left'
})

// 获取箭头符号
const getArrowSymbol = computed(() => {
    switch (getArrowClass.value) {
        case 'arrow-straight':
            return '⬆'
        case 'arrow-right':
            return '⬈'
        case 'arrow-left':
            return '⬉'
        default:
            return '⬆'
    }
})

// 获取方向提示文本
const getDirectionText = computed(() => {
    switch (getArrowClass.value) {
        case 'arrow-straight':
            return '继续前进'
        case 'arrow-right':
            return '向右转'
        case 'arrow-left':
            return '向左转'
        default:
            return ''
    }
})

onMounted(async () => {
    await startTracking()
    getSavedDirection()
})

onUnmounted(() => {
    stopDeviceOrientation()
    if (videoStream.value) {
        videoStream.value.getTracks().forEach(track => track.stop())
    }
})
</script>

<style scoped>
.camera-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    background: #000;
}

.camera {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.top-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 88px;
    padding-top: 44px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
}

.back-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-icon {
    font-size: 24px;
    color: #fff;
}

.title {
    flex: 1;
    text-align: center;
    color: #fff;
    font-size: 18px;
}

.bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    padding-bottom: env(safe-area-inset-bottom);
    flex-direction: row;
    gap: 20px;
}

.control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(246, 211, 101, 0.9);
    border-radius: 24px;
    transition: all 0.3s ease;
}

.control-btn:active {
    transform: scale(0.95);
}

.btn-icon {
    font-size: 28px;
}

.btn-text {
    font-size: 14px;
    color: #fff;
    font-weight: 500;
}

.error-popup {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    width: 280px;
}

.error-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    display: block;
    text-align: center;
}

.error-message {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    display: block;
    text-align: center;
}

.error-btn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
    border: none;
}

.unsupported-tip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #fff;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.ar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.target-marker {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.marker-symbol {
    font-size: 64px;
    color: #f6d365;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    animation: pulse 1.5s infinite;
}

.marker-text {
    font-size: 16px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 12px;
    border-radius: 12px;
}

.direction-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.hint-arrow {
    font-size: 64px;
    color: #f6d365;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hint-text {
    font-size: 16px;
    color: #fff;
    background: rgba(0, 0, 0, 0.5);
    padding: 4px 12px;
    border-radius: 12px;
}

.arrow-straight {
    animation: pulse 1.5s infinite;
}

.arrow-left {
    animation: slideLeft 1.5s infinite;
}

.arrow-right {
    animation: slideRight 1.5s infinite;
}

@keyframes slideLeft {
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(-10px);
    }
}

@keyframes slideRight {
    0%, 100% {
        transform: translateX(0);
    }
    50% {
        transform: translateX(10px);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.debug-info {
    position: absolute;
    top: 100px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.debug-info text {
    color: #fff;
    font-size: 12px;
}

.compass-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
}

.compass-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.compass-ring {
    width: 250px;
    height: 250px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    position: relative;
}

.compass-pointer {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 50%;
    background: #f6d365;
    transform-origin: bottom center;
    transition: transform 0.3s ease;
}

.pointer-text {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: #f6d365;
    font-size: 18px;
    font-weight: bold;
}

.target-pointer {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 50%;
    transform-origin: bottom center;
    transition: transform 0.3s ease;
}

.target-arrow {
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 24px;
}

.compass-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.degree-text {
    color: #fff;
    font-size: 18px;
}

.direction-buttons {
    display: flex;
    gap: 20px;
}

.direction-btn {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
}

.direction-btn:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
}

.action-buttons {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.cancel-btn,
.confirm-btn {
    width: 120px;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
}

.confirm-btn {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
}

.cancel-btn:active,
.confirm-btn:active {
    opacity: 0.8;
    transform: scale(0.98);
}
</style>
