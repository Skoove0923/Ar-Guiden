<template>
  <view class="notification-container">
    <view class="notification-header">
      <text class="title">消息通知</text>
      <text class="clear" @click="clearAllNotifications">清空</text>
    </view>
    
    <scroll-view 
      class="notification-list" 
      scroll-y="true"
      @scrolltolower="loadMoreNotifications"
    >
      <view v-if="notifications.length === 0" class="empty-state">
        <image src="/static/empty-notification.png" mode="aspectFit" />
        <text>暂无通知</text>
      </view>
      
      <view 
        v-for="(item, index) in notifications" 
        :key="index"
        class="notification-item"
        :class="{ unread: !item.isRead }"
        @click="handleNotificationClick(item)"
      >
        <view class="notification-icon">
          <image :src="getNotificationIcon(item.type)" mode="aspectFit" />
          <view v-if="!item.isRead" class="unread-dot"></view>
        </view>
        
        <view class="notification-content">
          <view class="notification-title">{{ item.title }}</view>
          <view class="notification-message">{{ item.message }}</view>
          <view class="notification-time">{{ formatTime(item.time) }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

interface Notification {
  id: string
  type: 'system' | 'chat' | 'alert'
  title: string
  message: string
  time: number
  isRead: boolean
  data?: any
}

const userStore = useUserStore()
const notifications = ref<Notification[]>([])
const page = ref(1)
const pageSize = 20
const loading = ref(false)

// 获取通知图标
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'system':
      return '/static/system-notification.png'
    case 'chat':
      return '/static/chat-notification.png'
    case 'alert':
      return '/static/alert-notification.png'
    default:
      return '/static/default-notification.png'
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now.getTime() - date.getTime()
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 小于7天
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  
  return date.toLocaleDateString()
}

// 加载通知
const loadNotifications = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    // 这里替换为实际的API调用
    const response = await uni.request({
      url: '/api/notifications',
      method: 'GET',
      data: {
        page: page.value,
        pageSize,
        userId: userStore.userInfo.id
      }
    })
    
    if (page.value === 1) {
      notifications.value = response.data
    } else {
      notifications.value.push(...response.data)
    }
    
    page.value++
  } catch (error) {
    console.error('加载通知失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载更多通知
const loadMoreNotifications = () => {
  loadNotifications()
}

// 处理通知点击
const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    try {
      // 标记为已读
      await uni.request({
        url: `/api/notifications/${notification.id}/read`,
        method: 'PUT'
      })
      
      // 更新本地状态
      const index = notifications.value.findIndex(n => n.id === notification.id)
      if (index !== -1) {
        notifications.value[index].isRead = true
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  
  // 根据通知类型处理跳转
  switch (notification.type) {
    case 'chat':
      uni.navigateTo({
        url: `/pages/message/index?target=${notification.data.fromUser}`
      })
      break
    case 'alert':
      // 处理警报通知
      break
    case 'system':
      // 处理系统通知
      break
  }
}

// 清空所有通知
const clearAllNotifications = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.request({
            url: '/api/notifications/clear',
            method: 'DELETE',
            data: {
              userId: userStore.userInfo.id
            }
          })
          
          notifications.value = []
          uni.showToast({
            title: '清空成功',
            icon: 'success'
          })
        } catch (error) {
          console.error('清空通知失败:', error)
          uni.showToast({
            title: '清空失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notification-container {
  height: 100%;
  background: #f5f5f5;
}

.notification-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.title {
  font-size: 16px;
  font-weight: 500;
}

.clear {
  font-size: 14px;
  color: #999;
}

.notification-list {
  height: calc(100% - 50px);
}

.empty-state {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.empty-state image {
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
}

.notification-item {
  padding: 15px;
  background: #fff;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #eee;
}

.notification-item.unread {
  background: #f0f9ff;
}

.notification-icon {
  position: relative;
  width: 40px;
  height: 40px;
  margin-right: 12px;
}

.notification-icon image {
  width: 100%;
  height: 100%;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff4d4f;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .notification-container {
    background: #1a1a1a;
  }
  
  .notification-header,
  .notification-item {
    background: #222;
    border-color: #333;
  }
  
  .notification-item.unread {
    background: #1c2c3f;
  }
  
  .notification-title {
    color: #fff;
  }
  
  .notification-message {
    color: #999;
  }
}
</style> 