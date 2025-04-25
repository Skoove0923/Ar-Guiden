<template>
    <layout :title="`第${currentLevel}关`">
        <!-- 添加返回按钮 -->
        <view class="back-btn" @click="handleBackClick">
            <text class="back-icon">←</text>
            <text class="back-text">返回</text>
        </view>
        <view class="quiz-container">
            <!-- 进度指示器 -->
            <view class="progress-bar">
                <text class="progress-text">{{ currentQuestionIndex + 1 }}/{{ questions.length }}</text>
                <view class="timer">{{ formatTime(timeLeft) }}</view>
            </view>

            <!-- 题目内容 -->
            <view class="question-card">
                <text class="question-text">{{ currentQuestion.question }}</text>
                
                <!-- 选项列表 -->
                <view class="options-list">
                    <view
                        v-for="(option, index) in currentQuestion.options"
                        :key="index"
                        class="option-item"
                        :class="{
                            'selected': selectedAnswer === index,
                            'correct': showResult && index === currentQuestion.correctAnswer,
                            'wrong': showResult && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer
                        }"
                        @click="selectAnswer(index)"
                    >
                        <text class="option-label">{{ ['A', 'B', 'C', 'D'][index] }}</text>
                        <text class="option-text">{{ option }}</text>
                    </view>
                </view>

                <!-- 添加答案解析区域 -->
                <view v-if="showResult" class="answer-analysis" :class="{ 'slide-in': showResult }">
                    <view class="analysis-header">
                        <text class="analysis-title">{{ selectedAnswer === currentQuestion.correctAnswer ? '回答正确' : '回答错误' }}</text>
                        <text v-if="selectedAnswer !== currentQuestion.correctAnswer" class="countdown">{{ countDown }}s</text>
                    </view>
                    <text class="analysis-text">{{ currentQuestion.analysis }}</text>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="bottom-actions">
                <button 
                    class="action-btn"
                    :disabled="selectedAnswer === null && !showResult"
                    @click="handleNext"
                >
                    {{ showResult ? (isLastQuestion ? '完成' : '下一题') : '确认' }}
                </button>
                    </view>
                    
            <!-- 结果弹窗 -->
            <uni-popup ref="resultPopup" type="center">
                <view class="result-popup">
                    <view class="result-content">
                        <text class="result-title">{{ score >= 80 ? '恭喜通关！' : '再接再厉！' }}</text>
                        <text class="result-score">得分：{{ score }}分</text>
                        <text class="result-detail">正确：{{ correctCount }}题</text>
                        <text class="result-detail">用时：{{ formatTime(totalTime) }}</text>
                        <text class="result-tip" v-if="score < 80">需要达到80分才能解锁下一关哦~</text>
                    </view>
                    <view class="result-actions">
                        <button class="result-btn" @click="goBack">返回关卡</button>
                        <button class="result-btn retry" @click="retryLevel">重新挑战</button>
                    </view>
                </view>
            </uni-popup>
        </view>
    </layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/user'
import { onLoad } from '@dcloudio/uni-app'
import questionsApi from '@/api/questions'

const userStore = useUserStore()
const currentLevel = ref(1)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const showResult = ref(false)
const score = ref(0)
const correctCount = ref(0)
const timeLeft = ref(300) // 5分钟倒计时
const totalTime = ref(0)
const timer = ref<number | null>(null)
const resultPopup = ref()
const countDown = ref(5)

// 题目数据
const questionsData = ref([])

interface Question {
    id: number;
    content: string;
    level: number;
    correctAnswer: string;
    explanation: string;
    options: string[];
}

// 将字母答案转换为数字索引
const letterToIndex = (letter: string): number => {
    return letter.charCodeAt(0) - 'A'.charCodeAt(0);
}

// 当前关卡的题目
const questions = computed(() => {
    return questionsData.value.map((q: any) => ({
        id: q.id,
        question: q.content,
        correctAnswer: letterToIndex(q.correctAnswer),
        analysis: q.explanation,
        options: [q.answerA, q.answerB, q.answerC, q.answerD] // 使用后端提供的选项
    }));
});

// 当前题目
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

// 是否为最后一题
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

// 格式化时间
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 选择答案
const selectAnswer = (index: number) => {
    if (!showResult.value) {
        selectedAnswer.value = index
    }
}

// 处理下一步
const handleNext = () => {
    if (selectedAnswer.value === null) {
        uni.showToast({
            title: '请选择一个答案',
            icon: 'none'
        })
        return
    }

    if (!showResult.value) {
        showResult.value = true
        if (selectedAnswer.value === currentQuestion.value.correctAnswer) {
            correctCount.value++
            // 答对1秒后自动下一题
            setTimeout(() => {
                nextQuestion()
            }, 1000)
        } else {
            // 答错启动5秒倒计时
            countDown.value = 5
            const countTimer = setInterval(() => {
                countDown.value--
                if (countDown.value <= 0) {
                    clearInterval(countTimer)
                    nextQuestion()
                }
            }, 1000)
        }
    }
}

// 抽取进入下一题的逻辑为单独函数
const nextQuestion = () => {
    if (isLastQuestion.value) {
        finishQuiz()
    } else {
        currentQuestionIndex.value++
        selectedAnswer.value = null
        showResult.value = false
    }
}

// 完成答题
const finishQuiz = () => {
    if (timer.value) {
        clearInterval(timer.value)
    }
    totalTime.value = 300 - timeLeft.value
    score.value = Math.round((correctCount.value / questions.value.length) * 100)
    
    // 只有分数大于80才触发完成事件解锁下一关
    if (score.value >= 80) {
        uni.$emit('quiz-completed', {
            level: currentLevel.value,
            score: score.value,
            passed: true
        })
    }
    
    // 显示结果弹窗
    resultPopup.value.open()
}

// 返回关卡选择
const goBack = () => {
    // 使用 reLaunch 而不是 navigateTo，避免页面堆栈问题
    uni.reLaunch({
        url: '/pages/DivideAndConquer/index'
    })
}

// 重新挑战
const retryLevel = () => {
    currentQuestionIndex.value = 0
    selectedAnswer.value = null
    showResult.value = false
    score.value = 0
    correctCount.value = 0
    timeLeft.value = 300
    resultPopup.value.close()
    startTimer()
}

// 开始计时器
const startTimer = () => {
    timer.value = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--
        } else {
            finishQuiz()
        }
    }, 1000)
}

// 获取题目数据
onMounted(async () => {
    // 获取当前关卡
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const level = parseInt(currentPage.options?.level || '1')
    currentLevel.value = level
    
    try {
        const res = await questionsApi.getQuestionsList(currentLevel.value)
        if (res.data.code === 100200) {
            questionsData.value = res.data.data.filter((q: Question) => q.level === currentLevel.value)
            console.log('题目数据:', questionsData.value)
        } else {
            showError('获取题目失败')
        }
    } catch (error) {
        console.error('获取题目失败:', error)
        showError('获取题目失败，请检查网络连接')
    }

    // 开始计时
    startTimer()
})

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value)
    }
})

// 处理返回按钮点击
const handleBackClick = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出答题吗？当前进度将不会保存。',
        success: (res) => {
            if (res.confirm) {
                if (timer.value) {
                    clearInterval(timer.value)
                }
                uni.reLaunch({
                    url: '/pages/DivideAndConquer/index'
                })
            }
        }
    })
}
</script>

<style scoped>
.quiz-container {
    padding: 20px;
    padding-bottom: 100px; /* 增加底部内边距，为按钮留出空间 */
    min-height: 100vh;
    background: #f5f5f5;
}

.progress-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.progress-text, .timer {
    font-size: 16px;
    color: #666;
}

.question-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.question-text {
    font-size: 18px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 20px;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.option-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    border-radius: 8px;
    background: #f8f8f8;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.option-item::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease-out, height 0.6s ease-out;
}

.option-item:active::after {
    width: 200%;
    height: 200%;
}

.option-label {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    border-radius: 12px;
    background: #eee;
    color: #666;
    font-size: 14px;
}

.option-text {
    flex: 1;
    font-size: 16px;
    color: #333;
}

.selected {
    background: #f6d365;
    transform: translateX(10px);
    box-shadow: 0 4px 12px rgba(246, 211, 101, 0.2);
}

.selected .option-label {
    background: #fff;
    color: #f6d365;
}

.correct {
    background: #9fd6ae;
    animation: correct 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes correct {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.wrong {
    background: #ffb8b8;
    animation: wrong 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes wrong {
    0%, 100% {
        transform: translateX(0);
    }
    20%, 60% {
        transform: translateX(-5px);
    }
    40%, 80% {
        transform: translateX(5px);
    }
}

.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: #fff;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 100; /* 确保按钮在最上层 */
}

.action-btn {
    width: 100%;
    height: 44px;
    line-height: 44px;
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
    border-radius: 22px;
    font-size: 16px;
    border: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.action-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(246, 211, 101, 0.4);
}

.action-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease-out, height 0.6s ease-out;
}

.action-btn:active::after {
    width: 300%;
    height: 300%;
}

.action-btn[disabled] {
    opacity: 0.6;
}

.result-popup {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    width: 280px;
    animation: popup 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-content {
    text-align: center;
    margin-bottom: 20px;
}

.result-title {
    font-size: 24px;
    font-weight: bold;
    color: v-bind(score >= 80 ? '#4CAF50' : '#ff6b6b');
    margin-bottom: 20px;
}

.result-score {
    font-size: 24px;
    color: #f6d365;
    margin-bottom: 10px;
}

.result-detail {
    font-size: 14px;
    color: #666;
    margin: 5px 0;
}

.result-actions {
    display: flex;
    gap: 10px;
}

.result-btn {
    flex: 1;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    font-size: 14px;
    border: none;
}

.retry {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
}

/* 弹窗动画 */
@keyframes popup {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 题目切换动画 */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 计时器闪烁动画 */
@keyframes pulse {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

/* 进度文本渐变动画 */
.progress-text {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    -webkit-background-clip: text;
    color: transparent;
    transition: all 0.3s ease;
}

.answer-analysis {
    margin-top: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border-left: 4px solid;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
}

.answer-analysis.slide-in {
    opacity: 1;
    transform: translateY(0);
}

.analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.analysis-title {
    font-size: 16px;
    font-weight: 600;
}

.countdown {
    font-size: 14px;
    color: #666;
}

.analysis-text {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
}

.correct .answer-analysis {
    border-color: #9fd6ae;
    background: rgba(159, 214, 174, 0.1);
}

.wrong .answer-analysis {
    border-color: #ffb8b8;
    background: rgba(255, 184, 184, 0.1);
}

.result-tip {
    font-size: 14px;
    color: #ff6b6b;
    margin-top: 10px;
    text-align: center;
}

.back-btn {
    position: fixed;
    top: calc(44px + var(--status-bar-height));
    left: 15px;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-icon {
    font-size: 20px;
    color: #333;
    margin-right: 4px;
}

.back-text {
    font-size: 14px;
    color: #333;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .back-btn {
        background: rgba(45, 45, 45, 0.9);
    }

    .back-icon,
    .back-text {
        color: #fff;
    }
}
</style>
