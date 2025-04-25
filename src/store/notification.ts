import { defineStore } from 'pinia'

interface Notification {
  id: string
  title: string
  content: string
  type: 'message' | 'system' | 'alarm'
  read: boolean
  timestamp: number
  from?: string
  to?: string
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0
  }),

  actions: {
    addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: Date.now(),
        read: false
      }
      this.notifications.unshift(newNotification)
      this.updateUnreadCount()
      // 触发系统通知
      this.showSystemNotification(newNotification)
    },

    markAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
        this.updateUnreadCount()
      }
    },

    markAllAsRead() {
      this.notifications.forEach(n => n.read = true)
      this.updateUnreadCount()
    },

    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length
    },

    clearNotifications() {
      this.notifications = []
      this.unreadCount = 0
    },

    async showSystemNotification(notification: Notification) {
      // #ifdef H5
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.content,
          icon: '/static/notification-icon.png'
        })
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.content,
            icon: '/static/notification-icon.png'
          })
        }
      }
      // #endif

      // #ifdef APP-PLUS
      uni.createPushMessage({
        title: notification.title,
        content: notification.content,
        payload: {
          type: notification.type,
          id: notification.id
        }
      })
      // #endif
    }
  }
}) 