<template>
  <layout title="个人中心">
    <view class="profile-container">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-header">
          <image 
            :src="userInfo.image || '/static/default-avatar.png'" 
            class="avatar" 
            mode="aspectFill"
          />
          <view class="user-info">
            <text class="username">{{ userInfo.name || '未设置昵称' }}</text>
            <text class="user-id">ID: {{ userInfo.id }}</text>
          </view>
        </view>
      </view>

      <!-- 功能列表 -->
      <view class="function-list">
        <view class="function-group">
          <view class="function-item" v-for="(item, index) in functionList" :key="index" @click="handleFunction(item)">
            <view class="item-left">
              <view class="icon-container">
                <text class="item-icon">{{ item.icon }}</text>
              </view>
              <text class="item-text">{{ item.name }}</text>
            </view>
            <text class="arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/user'
import user from '@/api/user'

const userStore = useUserStore()
const userInfo = ref({
  id: '',
  name: '',
  image: '',
  email: ''
})

const functionList = [
  { name: '更新头像', icon: '🎨', action: 'updateAvatar' },
  { name: '个人资料', icon: '👤', action: 'editProfile' },
  { name: '我的评论', icon: '💬', action: 'myComments' },
  { name: '关于我们', icon: 'ℹ️', action: 'about' },
  
]

onMounted(() => {
  userInfo.value = userStore.userInfo
  userStore.setUserInfo(userStore.getUserInfo())
})

const handleFunction = (item) => {
  switch (item.action) { 
    case 'updateAvatar':
      uni.navigateTo({ url: '/pages/profile/item/avatarUpload' })
      break
    case 'editProfile':
      uni.navigateTo({ url: '/pages/profile/item/personalData' })
      break
    case 'myComments':
      uni.navigateTo({ url: '/pages/profile/item/myComments' })
      break
    case 'notifications':
      uni.navigateTo({ url: '/pages/profile/item/notifications' })
      break
    case 'about':
      uni.navigateTo({ url: '/pages/profile/item/aboutUs' })
      break
   
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        user.logout()
        uni.reLaunch({ url: '/pages/index/login' })
      }
    }
  })
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f7fbfc;
  padding-bottom: 30px;
}

.user-card {
  background: linear-gradient(135deg, #76daff, #49c5b6);
  padding: 30px 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(73, 197, 182, 0.2);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 100px;
  height: 100px;
  background: rgba(119, 227, 213, 0.1);
  border-radius: 50%;
  z-index: 0;
}

.user-card::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 120px;
  height: 120px;
  background: rgba(118, 218, 255, 0.1);
  border-radius: 50%;
  z-index: 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:active {
  transform: scale(0.95);
}

.user-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.username {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-id {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.function-list {
  background: #fff;
  border-radius: 16px;
  margin: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.function-group {
  padding: 0 15px;
}

.function-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.3s ease;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:active {
  background-color: #f5f9fa;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-container {
  width: 36px;
  height: 36px;
  background-color: #f7f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-icon {
  font-size: 18px;
}

.function-item:active .icon-container {
  background: linear-gradient(135deg, rgba(118, 218, 255, 0.2), rgba(73, 197, 182, 0.2));
  box-shadow: 0 4px 10px rgba(73, 197, 182, 0.15);
  transform: scale(1.05);
}

.item-text {
  font-size: 16px;
  color: #37474f;
}

.arrow {
  font-size: 20px;
  color: #78909c;
  transition: transform 0.3s ease;
}

.function-item:active .arrow {
  transform: translateX(3px);
  color: #49c5b6;
}

.logout-section {
  padding: 20px 30px;
  margin-top: 30px;
}

.logout-btn {
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: #fff;
  color: #ff6b6b;
  border-radius: 22px;
  font-size: 16px;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.logout-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
</style> 