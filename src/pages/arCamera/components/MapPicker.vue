<template>
    <view class="map-picker">
        <!-- 添加顶部导航栏 -->
        <view class="nav-bar">
            <text class="close-btn" @click="$emit('cancel')">✕</text>
            <text class="title">选择目标位置</text>
        </view>

        <!-- 地图容器 -->
        <view class="map-container">
            <map
                id="map"
                v-if="mapReady"
                class="map"
                :latitude="mapCenter.latitude"
                :longitude="mapCenter.longitude"
                :markers="markers"
                :show-location="true"
                :scale="16"
                :enable-scroll="true"
                :enable-rotate="false"
                :enable-overlooking="false"
                :enable-3D="false"
                :enable-zoom="true"
                :gesture-zoom="true"
                :show-compass="false"
                :enable-building="false"
                :enable-traffic="false"
                :enable-poi="true"
                @tap="handleMapTap"
                @regionchange="handleRegionChange"
            >
                <!-- 中心点标记 -->
                <cover-view class="center-marker" v-if="!selectedLocation">
                    <cover-view class="marker-dot"></cover-view>
                </cover-view>
            </map>
            <view v-else class="loading">
                <text>地图加载中...</text>
            </view>
        </view>

        <!-- 搜索框 -->
        <view class="search-box">
            <input 
                type="text" 
                v-model="searchText"
                placeholder="搜索位置"
                @confirm="handleSearch"
            />
        </view>

        <!-- 位置信息 -->
        <view class="location-info" v-if="selectedLocation">
            <view class="info-content">
                <text class="info-title">已选位置</text>
                <text class="info-address">{{ locationAddress || '获取地址中...' }}</text>
                <text class="info-coords">
                    {{ selectedLocation.latitude.toFixed(6) }}, 
                    {{ selectedLocation.longitude.toFixed(6) }}
                </text>
            </view>
        </view>

        <!-- 底部控制栏 -->
        <view class="controls">
            <button class="location-btn" @click="moveToCurrentLocation">
                <text class="btn-icon">📍</text>
            </button>
            <button class="confirm-btn" @click="confirmLocation" :disabled="!selectedLocation">
                {{ selectedLocation ? '确认目标位置' : '点击地图选择目标位置' }}
            </button>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'

const props = defineProps<{
    initialLocation?: {
        latitude: number
        longitude: number
    }
}>()

const emit = defineEmits(['confirm', 'cancel'])
const mapReady = ref(false)
const mapScale = ref(16)
const minScale = 3
const maxScale = 20
const searchText = ref('')
const locationAddress = ref('')

// 使用 reactive 来管理地图中心点
const mapCenter = reactive({
    latitude: props.initialLocation?.latitude || 29.533155,
    longitude: props.initialLocation?.longitude || 106.604423
})

const currentLocation = ref({
    latitude: props.initialLocation?.latitude || 29.533155,
    longitude: props.initialLocation?.longitude || 106.604423
})

const selectedLocation = ref<{latitude: number, longitude: number} | null>(null)
const markers = ref<any[]>([])

// 缩放控制
const zoomIn = () => {
    if (mapScale.value < maxScale) {
        mapScale.value++
    }
}

const zoomOut = () => {
    if (mapScale.value > minScale) {
        mapScale.value--
    }
}

// 获取当前位置
const getCurrentLocation = () => {
    uni.getLocation({
        type: 'gcj02',
        isHighAccuracy: true,
        success: (res) => {
            currentLocation.value = {
                latitude: res.latitude,
                longitude: res.longitude
            }
            // 更新地图中心点
            mapCenter.latitude = res.latitude
            mapCenter.longitude = res.longitude
            mapReady.value = true
        },
        fail: () => {
            mapReady.value = true
            uni.showToast({
                title: '无法获取位置',
                icon: 'none'
            })
        }
    })
}

// 处理地图点击
const handleMapTap = (e: any) => {
    const { latitude, longitude } = e.detail
    selectedLocation.value = { latitude, longitude }
    markers.value = [{
        id: 1,
        latitude,
        longitude,
        iconPath: '/static/location.png',
        width: 32,
        height: 32,
        anchor: {
            x: 0.5,
            y: 1
        }
    }]
}

// 处理地图区域变化
const handleRegionChange = (e: any) => {
    if (e.type === 'end' && e.causedBy === 'drag') {
        // 更新地图中心点
        const { latitude, longitude } = e.detail.center
        mapCenter.latitude = latitude
        mapCenter.longitude = longitude
    }
}

// 确认选择
const confirmLocation = () => {
    if (selectedLocation.value) {
        emit('confirm', selectedLocation.value)
    }
}

// 移动到当前位置
const moveToCurrentLocation = () => {
    const mapContext = uni.createMapContext('map')
    mapContext?.moveToLocation({
        latitude: currentLocation.value.latitude,
        longitude: currentLocation.value.longitude,
        success: () => {
            mapCenter.latitude = currentLocation.value.latitude
            mapCenter.longitude = currentLocation.value.longitude
        }
    })
}

// 改进地址获取方法
const getAddressInfo = (latitude: number, longitude: number) => {
    uni.request({
        url: `https://apis.map.qq.com/ws/geocoder/v1/`,
        method: 'GET',
        data: {
            location: `${latitude},${longitude}`,
            key: 'Y2JBZ-TOVRU-DWWV3-GNNBU-YZB57-ZJBRY',
            get_poi: 1
        },
        success: (res: any) => {
            if (res.data.status === 0) {
                const result = res.data.result
                locationAddress.value = result.address
                // 如果有POI信息，显示最近的POI
                if (result.pois && result.pois.length > 0) {
                    locationAddress.value += ` (近${result.pois[0].title})`
                }
            }
        },
        fail: () => {
            locationAddress.value = '无法获取地址信息'
        }
    })
}

// 搜索位置
const handleSearch = () => {
    if (!searchText.value) return
    uni.request({
        url: `https://apis.map.qq.com/ws/place/v1/search?keyword=${encodeURIComponent(searchText.value)}&boundary=nearby(${currentLocation.value.latitude},${currentLocation.value.longitude},1000)&key=Y2JBZ-TOVRU-DWWV3-GNNBU-YZB57-ZJBRY`,
        success: (res: any) => {
            if (res.data.status === 0 && res.data.data.length > 0) {
                const location = res.data.data[0].location
                selectedLocation.value = {
                    latitude: location.lat,
                    longitude: location.lng
                }
                const mapContext = uni.createMapContext('map')
                mapContext?.moveToLocation({
                    latitude: location.lat,
                    longitude: location.lng
                })
            }
        }
    })
}

onMounted(() => {
    getCurrentLocation()
})
</script>

<style scoped>
.map-picker {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.nav-bar {
    height: 44px;
    padding-top: var(--status-bar-height);
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.close-btn {
    font-size: 24px;
    color: #333;
    padding: 8px;
}

.title {
    flex: 1;
    text-align: center;
    font-size: 18px;
    font-weight: 500;
}

.map-container {
    flex: 1;
    position: relative;
    touch-action: pan-x pan-y; /* 允许水平和垂直滑动 */
}

.map {
    width: 100%;
    height: 100%;
    display: block; /* 确保地图正确显示 */
}

.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #999;
}

.controls {
    padding: 20px;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
    width: 100%;
    height: 44px;
    line-height: 44px;
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
    border-radius: 22px;
    font-size: 16px;
    border: none;
}

.confirm-btn:disabled {
    opacity: 0.5;
    background: #ccc;
}

.search-box {
    position: absolute;
    top: 100px;
    left: 20px;
    right: 20px;
    z-index: 1;
}

.search-box input {
    width: 100%;
    height: 40px;
    background: #fff;
    border-radius: 20px;
    padding: 0 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    font-size: 14px;
}

.center-marker {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.marker-dot {
    width: 12px;
    height: 12px;
    background: #f6d365;
    border-radius: 50%;
    border: 2px solid #fff;
}

.location-info {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 100px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.info-title {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
}

.info-address {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
    word-break: break-all;
    line-height: 1.4;
}

.info-coords {
    font-size: 12px;
    color: #666;
}

.location-btn {
    position: absolute;
    right: 20px;
    bottom: 100px;
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1;
}

.btn-icon {
    font-size: 24px;
}

.zoom-controls {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 1;
}

.zoom-btn {
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: #fff;
    color: #333;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: none;
    padding: 0;
}

.zoom-btn:active {
    opacity: 0.8;
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0;
    }
}
</style> 