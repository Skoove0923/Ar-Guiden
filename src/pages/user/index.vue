<template>
  <view class="user-container">
    <!-- 其他个人信息内容 -->
    
    <!-- 消息通知入口 -->
    <view class="menu-item" @click="openNotifications">
      <view class="menu-left">
        <uni-icons type="notification" size="24"></uni-icons>
        <text>消息通知</text>
      </view>
      <view class="menu-right">
        <view v-if="unreadCount > 0" class="badge">{{ unreadCount }}</view>
        <uni-icons type="right" size="16"></uni-icons>
      </view>
    </view>
    
    <!-- 消息通知抽屉 -->
    <uni-drawer ref="notificationDrawer" mode="right" :mask-click="true">
      <MessageNotification />
    </uni-drawer>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MessageNotification from '@/components/MessageNotification.vue'

const notificationDrawer = ref(null)
const unreadCount = ref(0)

// 打开通知抽屉
const openNotifications = () => {
  notificationDrawer.value.open()
}

// 获取未读消息数量
const getUnreadCount = async () => {
  try {
    const response = await uni.request({
      url: '/api/notifications/unread/count',
      method: 'GET'
    })
    unreadCount.value = response.data
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 监听新消息
uni.$on('newNotification', () => {
  getUnreadCount()
})

onMounted(() => {
  getUnreadCount()
})

onUnmounted(() => {
  uni.$off('newNotification')
})
</script>

<style scoped>
.menu-item {
  padding: 15px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-right {
  display: flex;
  align-items: center;
}

.badge {
  background: #ff4d4f;
  color: #fff;
  font-size: 12px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  border-radius: 9px;
  margin-right: 5px;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .menu-item {
    background: #222;
    border-color: #333;
  }
}
</style> 