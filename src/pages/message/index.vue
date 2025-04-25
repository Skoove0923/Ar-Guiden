<template>
    <view class="page-container">
        <!-- 自定义状态栏 -->
        <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

        <view class="chat-container">
            <!-- 聊天区域 -->
            <view class="chat-area">
                <view class="chat-header">
                    <view class="header-left" @click="openFriendsList">
                        <uni-icons type="bars" size="24"></uni-icons>
                    </view>
                    <view class="header-title">
                        <text v-if="toName">{{ toName }}</text>
                        <text v-else>选择好友开始聊天</text>
                    </view>
                    <text :class="['status', isOnline ? 'online' : 'offline']">
                        {{ isOnline ? '在线' : '离线' }}
                    </text>
                </view>

                <!-- 未选择好友时显示提示 -->
                <view v-if="!toName" class="empty-state">
                    <image src="/static/chat-empty.png" mode="aspectFit" />
                    <text>选择一位好友开始聊天</text>
                </view>

                <!-- 消息列表 -->
                <scroll-view class="messages" scroll-y="true" :scroll-top="scrollTop">
                    <view v-for="(message, index) in historyMessage" :key="index" class="message-wrapper"
                        :class="{ 'message-self': message.toName }">
                        <!-- 发送的消息 -->
                        <view v-if="message.toName" class="message sent">
                            <view class="message-content">
                                {{ message.message }}
                            </view>
                            <view class="avatar-container">
                                <view class="avatar">
                                    <image :src="userStore.userInfo.image" />
                                </view>
                            </view>
                        </view>

                        <!-- 接收的消息 -->
                        <view v-else class="message received">
                            <view class="message-content">
                                {{ message.message }}
                            </view>
                        </view>
                    </view>
                </scroll-view>

                <!-- 输入区域 -->
                <view class="input-area" v-if="toName">
                    <input v-model="messageContent" class="message-input" placeholder="输入消息..." @keyup.enter="submit" />
                    <button class="send-btn" @click="submit" :disabled="!messageContent">发送</button>
                </view>
            </view>

            <!-- 好友列表抽屉 -->
            <uni-drawer ref="drawer" mode="left" :mask-click="true" @close="onDrawerClose">
                <view class="friends-drawer">
                    <view class="drawer-header">
                        <text>好友列表</text>
                        <text class="online-count">{{ friendsList.length }}人在线</text>
                    </view>

                    <scroll-view class="friends-scroll" scroll-y="true">
                        <view v-for="friend in friendsList" :key="friend" class="friend-item"
                            :class="{ 'active': friend === toName }" @click="selectFriend(friend)">
                            <view class="friend-avatar">
                                <image :src="getUserAvatar(friend)" />
                            </view>
                            <view class="friend-info">
                                <text class="friend-name">{{ friend }}</text>
                                <text class="friend-status">在线</text>
                            </view>
                        </view>
                    </scroll-view>
                </view>
            </uni-drawer>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const drawer = ref(null)
const newMessage = ref('')
const messages = ref([])
const ws = ref(null)
const userStore = useUserStore()
const isOnline = ref(true)
const toName = ref('')
const chatMes = ref(false)
const isShowChat = ref(false)
const historyMessage = ref([])
const friendsList = ref([])
const systemMessages = ref([])
const username = ref('')
const scrollTop = ref(0)
const sendMessage = ref({
    toName: '',
    message: ''
})
const messageContent = ref('')
const weburl = 'http://10.159.81.42'
// 获取状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight

// 从localStorage获取用户头像
const getUserAvatar = (username) => {
    try {
        const userInfo = localStorage.getItem(`user_${username}`)
        if (userInfo) {
            const parsedInfo = JSON.parse(userInfo)
            return parsedInfo.avatar || '/static/default-avatar.png'
        }
        return '/static/default-avatar.png'
    } catch (error) {
        console.error('获取用户头像失败:', error)
        return '/static/default-avatar.png'
    }
}

// 获取页面参数
onMounted(async () => {
    try {
        // 检查登录状态并初始化 WebSocket
        await init()

        // 获取页面参数
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const options = currentPage.$page.options

        if (options.target && options.message) {
            // 先选择目标用户
            toName.value = options.target
            messageContent.value = decodeURIComponent(options.message)

            // 等待 WebSocket 连接建立
            let retryCount = 0
            const maxRetries = 10
            const checkConnection = () => {
                if (isOnline.value && ws.value) {
                    submit()
                } else if (retryCount < maxRetries) {
                    retryCount++
                    setTimeout(checkConnection, 500)
                }
            }
            checkConnection()
        }
    } catch (error) {
        console.error('初始化失败:', error)
    }
})

// 检查登录状态
const checkLoginStatus = () => {
    console.log('当前store状态:', userStore)
    const isLoggedIn = userStore.token && userStore.userInfo && userStore.userInfo.username
    console.log('登录状态:', isLoggedIn, '用户信息:', userStore.userInfo)
    return isLoggedIn
}

// 关闭WebSocket连接
const closeWebSocket = () => {
    if (ws.value) {
        console.log('关闭WebSocket连接')
        ws.value.close(1000, '主动关闭')
        ws.value = null
        isOnline.value = false
    }
}

// 显示聊天窗口
const showChat = (name) => {
    toName.value = name
    sendMessage.value.toName = name
    const history = sessionStorage.getItem(name)
    historyMessage.value = history ? JSON.parse(history) : []
    isShowChat.value = true
    chatMes.value = true
}

// 发送消息
const submit = () => {
    if (!messageContent.value || !isOnline.value) return

    try {
        sendMessage.value = {
            toName: toName.value,
            message: messageContent.value
        }
        
        console.log('发送消息:', sendMessage.value)
        ws.value.send(JSON.stringify(sendMessage.value))
        historyMessage.value.push({
            toName: sendMessage.value.toName,
            message: sendMessage.value.message
        })
        sessionStorage.setItem(toName.value, JSON.stringify(historyMessage.value))
        messageContent.value = '' // 清空输入框
        
        // 发送消息后滚动到底部
        scrollToBottom()
    } catch (error) {
        console.error('发送消息失败:', error)
        uni.showToast({
            title: '发送失败',
            icon: 'none'
        })
    }
}

// 根据环境配置WebSocket地址
const getWebSocketUrl = () => {
    // 开发环境使用本地地址，生产环境使用实际域名
    const baseUrl = import.meta.env.PROD
        ? 'ws://your-production-domain.com'
        : 'ws://localhost:8080'

    const token = userStore.token
    const username = userStore.userInfo.username
    return `${baseUrl}/chat/${encodeURIComponent(username)}?token=${encodeURIComponent(token)}`
}

// 初始化WebSocket连接
const initWebSocket = () => {
    return new Promise((resolve, reject) => {
        try {
            const wsUrl = getWebSocketUrl()
            console.log('正在连接WebSocket:', wsUrl)

            // 如果已经有连接且状态正常，直接返回
            if (ws.value && ws.value.readyState === WebSocket.OPEN) {
                console.log('WebSocket连接已存在且正常')
                isOnline.value = true
                resolve()
                return
            }

            // 如果连接未关闭，先关闭
            if (ws.value && ws.value.readyState !== WebSocket.CLOSED) {
                ws.value.close()
            }

            ws.value = new WebSocket(wsUrl)

            ws.value.onopen = () => {
                console.log("WebSocket连接已建立")
                isOnline.value = true
                resolve()
            }

            ws.value.onclose = (event) => {
                console.log("WebSocket连接已关闭", event.code, event.reason)
                isOnline.value = false

                // 只有在非正常关闭时才重连
                if (event.code !== 1000 && event.code !== 1001) {
                    console.log('尝试重新连接...')
                    setTimeout(() => {
                        if (checkLoginStatus()) {
                            initWebSocket().catch(err => {
                                console.error('重连失败:', err)
                            })
                        }
                    }, 3000)
                }
            }

            ws.value.onerror = (error) => {
                console.error("WebSocket连接错误:", error)
                isOnline.value = false
                reject(error)
            }

            ws.value.onmessage = (evt) => {
                const res = JSON.parse(evt.data)
                console.log('收到消息:', res)

                if (res.system) {
                    // 系统消息，更新好友列表
                    const names = res.message
                    friendsList.value = []
                    systemMessages.value = []
                    names.forEach(name => {
                        if (name !== username.value) {
                            friendsList.value.push(name)
                            systemMessages.value.push(name)
                        }
                    })
                } else {
                    // 聊天消息
                    const fromName = res.fromName
                    const history = sessionStorage.getItem(fromName)
                    const newMessage = {
                        fromName: res.fromName,
                        message: res.message
                    }

                    if (!history) {
                        historyMessage.value = [newMessage]
                    } else {
                        historyMessage.value = [...JSON.parse(history), newMessage]
                    }
                    sessionStorage.setItem(fromName, JSON.stringify(historyMessage.value))
                    
                    // 收到新消息时滚动到底部
                    scrollToBottom()
                }
            }

        } catch (error) {
            console.error('初始化WebSocket失败:', error)
            reject(error)
        }
    })
}

// 初始化
const init = async () => {
    try {
        if (!checkLoginStatus()) {
            throw new Error('未登录')
        }

        username.value = userStore.userInfo.username
        console.log('当前用户名:', username.value)

        await initWebSocket()
        console.log('WebSocket初始化完成')
    } catch (error) {
        console.error('初始化失败:', error)
        handleInitError(error)
    }
}

// 处理初始化错误
const handleInitError = (error) => {
    if (error.message === '未登录') {
        uni.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 1500
        })
        setTimeout(() => {
            uni.redirectTo({
                url: '/pages/index/login'
            })
        }, 1500)
    }
}

onMounted(async () => {
    await init()
})

onUnmounted(() => {
    if (ws.value) {
        console.log('组件卸载，正常关闭WebSocket连接')
        ws.value.close(1000, '组件卸载')
    }
})

const openDrawer = () => {
    drawer.value.open()
}

const closeDrawer = () => {
    drawer.value.close()
}

// 打开好友列表抽屉
const openFriendsList = () => {
    drawer.value.open()
}

// 选择好友
const selectFriend = (friend) => {
    showChat(friend)
    drawer.value.close()
}

// 抽屉关闭回调
const onDrawerClose = () => {
    // 可以在这里处理抽屉关闭后的逻辑
}

// 实现滚动到底部的功能
const scrollToBottom = () => {
    nextTick(() => {
        // 使用一个足够大的值滚动到底部
        scrollTop.value = 999999
    })
}
</script>

<style scoped>
.page-container {
    height: 100vh;
    background: #f7f7f7;
}

.status-bar {
    width: 100%;
    background: #ffffff;
}

.chat-container {
    display: flex;
    height: calc(100vh - var(--status-bar-height));
    background: #f7f7f7;
}

.chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
    position: relative;
    width: 100%;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

.chat-header {
    height: 56px;
    padding: 0 16px;
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    top: var(--status-bar-height);
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
    padding: 8px;
    cursor: pointer;
    position: relative;
    z-index: 101;
    display: flex;
    align-items: center;
    height: 56px;
    transition: opacity 0.3s ease;
}

.header-left:active {
    opacity: 0.7;
}

.header-title {
    flex: 1;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
    margin: 0 40px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
}

.messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 80px;
    margin-top: calc(56px + var(--status-bar-height));
    padding-right: 16px;
}

.message-wrapper {
    margin: 12px 0;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message {
    display: flex;
    align-items: flex-start;
    max-width: 85%;
    transition: all 0.3s ease;
}

.message-self {
    align-items: flex-end;
    margin-left: auto;
}

.message-content {
    padding: 12px 16px;
    border-radius: 16px;
    word-break: break-all;
    font-size: 15px;
    line-height: 1.5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.sent .message-content {
    background: linear-gradient(135deg, #07C160, #0ab956);
    color: white;
    margin-right: 12px;
    border-radius: 16px 16px 4px 16px;
}

.received .message-content {
    background: white;
    color: #333;
    margin-left: 12px;
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar-container {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    margin-right: 8px;
}

.avatar {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.avatar:hover {
    transform: scale(1.05);
}

.avatar image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.input-area {
    padding: 12px 16px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    background: #ffffff;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding-bottom: calc(12px + constant(safe-area-inset-bottom));
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.message-input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #e8e8e8;
    border-radius: 24px;
    background: #f8f8f8;
    font-size: 15px;
    line-height: 20px;
    max-height: 120px;
    transition: all 0.3s ease;
}

.message-input:focus {
    border-color: #07C160;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(7, 193, 96, 0.1);
}

.send-btn {
    padding: 0 24px;
    background: linear-gradient(135deg, #07C160, #0ab956);
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 500;
    line-height: 44px;
    height: 44px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(7, 193, 96, 0.2);
}

.send-btn:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(7, 193, 96, 0.2);
}

.send-btn:disabled {
    background: #e8e8e8;
    box-shadow: none;
}

.friends-drawer {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    width: 280px;
}

.drawer-header {
    padding: 20px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
}

.drawer-header text {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.online-count {
    font-size: 14px;
    color: #07C160;
    font-weight: 500;
    background: rgba(7, 193, 96, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
}

.friends-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.friend-item {
    padding: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 12px;
    margin-bottom: 8px;
    background: #f9f9f9;
}

.friend-item:hover {
    background: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.friend-item.active {
    background: #f0f9f4;
    border: 1px solid rgba(7, 193, 96, 0.2);
}

.friend-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.friend-avatar image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.friend-info {
    flex: 1;
    margin-left: 16px;
}

.friend-name {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    margin-bottom: 4px;
}

.friend-status {
    font-size: 13px;
    color: #07C160;
    display: flex;
    align-items: center;
}

.friend-status::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #07C160;
    border-radius: 50%;
    margin-right: 6px;
    box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.2);
}

.empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: #999;
    margin-top: calc(56px + var(--status-bar-height));
}

.empty-state image {
    width: 160px;
    height: 160px;
    margin-bottom: 24px;
    opacity: 0.8;
}

.empty-state text {
    font-size: 16px;
    color: #666;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .page-container {
        background: #1a1a1a;
    }

    .chat-area {
        background: #222;
    }

    .chat-header {
        background: #2a2a2a;
        border-color: #333;
    }

    .header-title {
        color: #fff;
    }

    .message-input {
        background: #333;
        border-color: #444;
        color: #fff;
    }

    .message-input:focus {
        border-color: #07C160;
        background: #2a2a2a;
    }

    .received .message-content {
        background: #2a2a2a;
        color: #fff;
    }

    .friends-drawer {
        background: #222;
    }

    .drawer-header {
        background: #2a2a2a;
        border-color: #333;
    }
    
    .drawer-header text {
        color: #fff;
    }
    
    .online-count {
        background: rgba(7, 193, 96, 0.2);
    }

    .friend-item {
        background: #2a2a2a;
    }

    .friend-item:hover {
        background: #333;
    }

    .friend-item.active {
        background: #1a3a1a;
        border-color: rgba(7, 193, 96, 0.3);
    }

    .friend-name {
        color: #fff;
    }

    .empty-state text {
        color: #999;
    }
}
</style>