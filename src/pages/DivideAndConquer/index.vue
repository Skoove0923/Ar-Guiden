<template>
    <layout title="消防知识竞赛">
        <view class="level-container">
            <!-- 关卡列表 -->
            <view class="level-list">
                <view 
                    v-for="(level, index) in levels" 
                    :key="index"
                    class="level-item"
                    :class="{ 
                        'locked': !level.unlocked,
                        'completed': level.completed
                    }"
                    @click="handleLevelClick(level, index)"
                >
                    <view class="level-content">
                        <text class="level-icon">{{ level.unlocked ? '🎯' : '🔒' }}</text>
                        <text class="level-number">第{{ index + 1 }}关</text>
                        <text class="level-status">
                            {{ level.completed ? '已完成' : (level.unlocked ? '已解锁' : '未解锁') }}
                        </text>
                    </view>
                    <view class="level-progress" v-if="level.completed">
                        <text class="progress-text">得分：{{ level.score || 0 }}分</text>
                    </view>
                </view>
            </view>

            <!-- 提示弹窗 -->
            <uni-popup ref="popup" type="center">
                <view class="popup-content">
                    <text class="popup-title">提示</text>
                    <text class="popup-text">{{ popupMessage }}</text>
                    <button class="popup-btn" @click="closePopup">确定</button>
                </view>
            </uni-popup>
        </view>
    </layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Layout from '@/layout/index.vue'

const popup = ref()
const popupMessage = ref('')

// 关卡数据
const levels = ref([
    { id: 1, unlocked: true, completed: false, score: 0 },
    { id: 2, unlocked: false, completed: false, score: 0 },
    { id: 3, unlocked: false, completed: false, score: 0 },
    { id: 4, unlocked: false, completed: false, score: 0 },
    { id: 5, unlocked: false, completed: false, score: 0 },
    { id: 6, unlocked: false, completed: false, score: 0 },
    { id: 7, unlocked: false, completed: false, score: 0 },
    { id: 8, unlocked: false, completed: false, score: 0 },
    { id: 9, unlocked: false, completed: false, score: 0 },
    { id: 10, unlocked: false, completed: false, score: 0 }
])

// 处理关卡点击
const handleLevelClick = (level: any, index: number) => {
    if (!level.unlocked) {
        popupMessage.value = '请先完成上一关'
        popup.value.open()
        return
    }
    
    // 跳转到答题页面
    uni.navigateTo({
        url: `/pages/DivideAndConquer/level/index?level=${index + 1}`
    })
}

// 关闭弹窗
const closePopup = () => {
    popup.value.close()
}

// 从本地存储加载关卡状态
const loadLevelStatus = () => {
    const savedLevels = uni.getStorageSync('quiz-levels')
    if (savedLevels) {
        levels.value = JSON.parse(savedLevels)
    }
}

// 监听答题完成事件
uni.$on('quiz-completed', ({ level, score, passed }) => {
    // 更新当前关卡状态
    levels.value[level - 1].completed = passed
    levels.value[level - 1].score = score
    
    // 只有通过才解锁下一关
    if (passed && level < levels.value.length) {
        levels.value[level].unlocked = true
        uni.showToast({
            title: '恭喜解锁下一关！',
            icon: 'success'
        })
    } else if (!passed) {
        uni.showToast({
            title: '分数未达到80分，请继续努力！',
            icon: 'none'
        })
    }
    
    // 保存状态到本地存储
    uni.setStorageSync('quiz-levels', JSON.stringify(levels.value))
})

onMounted(() => {
    loadLevelStatus()
})
</script>

<style scoped>
.level-container {
    padding: 20px;
    min-height: 100vh;
    background: #f5f5f5;
}

.level-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 10px;
}

.level-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.level-item:active {
    transform: scale(0.98);
}

.level-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.level-icon {
    font-size: 24px;
}

.level-number {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.level-status {
    font-size: 12px;
    color: #666;
}

.level-progress {
    margin-top: 10px;
    text-align: center;
}

.progress-text {
    font-size: 12px;
    color: #f6d365;
}

.locked {
    opacity: 0.6;
    background: #f8f8f8;
}

.completed {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
}

.completed .level-number,
.completed .level-status {
    color: #fff;
}

.popup-content {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    width: 280px;
}

.popup-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    text-align: center;
}

.popup-text {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    text-align: center;
}

.popup-btn {
    width: 100%;
    height: 40px;
    line-height: 40px;
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
    border: none;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .level-container {
        background: #1f1f1f;
    }
    
    .level-item {
        background: #2d2d2d;
    }
    
    .level-number {
        color: #fff;
    }
    
    .level-status {
        color: #999;
    }
    
    .locked {
        background: #252525;
    }
    
    .popup-content {
        background: #2d2d2d;
    }
    
    .popup-title {
        color: #fff;
    }
    
    .popup-text {
        color: #ccc;
    }
}
</style>

