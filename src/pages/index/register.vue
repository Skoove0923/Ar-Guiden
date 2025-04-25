<template>
  <view class="register-container">
    <view class="register-card">
      <view class="card-header">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        
        <text class="welcome">创建账号</text>
        <text class="subtitle">填写以下信息完成注册</text>
      </view>
      
      <uni-forms :model="formState" ref="form" :rules="rules" class="register-form">
        <view class="avatar-container">
          <Avatar :src="avatarSrc" :size="100" />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="person" size="20" color="#8a8a8a"></uni-icons>
          </view>
          <uni-easyinput
            v-model="formState.username"
            placeholder="请输入用户名"
            class="custom-input"
          />
        </view>
        
        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="locked" size="20" color="#8a8a8a"></uni-icons>
          </view>
          <uni-easyinput
            v-model="formState.password"
            type="password"
            placeholder="请输入密码"
            class="custom-input"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="locked" size="20" color="#8a8a8a"></uni-icons>
          </view>
          <uni-easyinput
            v-model="formState.confirmPassword"
            type="password"
            placeholder="请确认密码"
            class="custom-input"
          />
        </view>

        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="email" size="20" color="#8a8a8a"></uni-icons>
          </view>
          <uni-easyinput
            v-model="formState.email"
            type="text"
            placeholder="请输入邮箱（选填）"
            class="custom-input"
          />
        </view>

        <button class="register-btn" @click="onFinish">注 册</button>

        <view class="help-links">
          <text class="help-text signup" @click="goToLogin">已有账号？立即登录</text>
        </view>
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import user from '@/api/user'
import Avatar from './component/Avatar.vue'

const avatarSrc = ref('')

const uploadAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      avatarSrc.value = res.tempFilePaths[0]
      // 将文件对象保存到 formState
      formState.avatar = res.tempFiles[0]
    }
  })
}

const form = ref(null)
const formState = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  avatar: ''
})

const rules = {
  username: {
    rules: [{
      required: true,
      errorMessage: '请输入用户名'
    }]
  },
  password: {
    rules: [{
      required: true,
      errorMessage: '请输入密码'
    }, {
      minLength: 6,
      errorMessage: '密码长度不能少于6位'
    }]
  },
  confirmPassword: {
    rules: [{
      required: true,
      errorMessage: '请确认密码'
    }, {
      validateFunction: function(rule, value, data, callback) {
        if (value !== formState.password) {
          callback('两次输入的密码不一致')
        }
        return true
      }
    }]
  },
  email: {
    rules: [{
      format: 'email',
      errorMessage: '邮箱格式不正确'
    }]
  }
}

const onFinish = async () => {
  try {
    const valid = await form.value.validate()
    if (valid) {
      const res = await user.register({
        username: formState.username,
        password: formState.password,
        email: formState.email
      }, formState.avatar)
      
      if (res.data.code === 100200) {
        uni.showToast({ 
          title: '注册成功！', 
          icon: 'success',
          success: () => {
            setTimeout(() => {
              uni.redirectTo({ url: '/pages/index/login' })
            }, 1500)
          }
        })
      } else {
        uni.showToast({ title: res.data.message || '注册失败', icon: 'none' })
      }
    }
  } catch (error) {
    console.error(error)
    uni.showToast({ title: '注册失败，请检查网络连接', icon: 'none' })
  }
}

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/index/login' })
}

onMounted(() => {
  uni.$on('avatar-click', uploadAvatar)
})

onUnmounted(() => {
  uni.$off('avatar-click', uploadAvatar)
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #76daff, #49c5b6);
  padding: 20px;
}

.register-card {
  width: 90%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.register-card::before {
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

.register-card::after {
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

.card-header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.welcome {
  font-size: 28px;
  color: #37474f;
  font-weight: 700;
  display: block;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #78909c;
  display: block;
}

.register-form {
  position: relative;
  z-index: 1;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #f5f9fa;
  border-radius: 12px;
  padding: 5px 15px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.input-group:focus-within {
  border-color: #49c5b6;
  box-shadow: 0 0 0 2px rgba(73, 197, 182, 0.15);
  background-color: #ffffff;
}

.input-icon {
  margin-right: 10px;
}

.custom-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  height: 48px;
}

.register-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #65d6e4, #49c5b6);
  border-radius: 12px;
  font-size: 16px;
  color: #fff;
  border: none;
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.register-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #5ac7d5, #3eb6a7);
}

.help-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.help-text {
  font-size: 14px;
  color: #78909c;
  transition: color 0.3s;
}

.signup {
  color: #49c5b6;
  font-weight: 600;
}

.help-text:hover {
  color: #65d6e4;
}

/* 修改uni-easyinput的输入框样式覆盖 */
:deep(.uni-easyinput__content-input) {
  color: #37474f !important;
}

:deep(.uni-easyinput__content-input:focus) {
  color: #37474f !important;
}

:deep(.is-input-border) {
  border: none !important;
}

:deep(.uni-easyinput__content) {
  background-color: transparent !important;
}

:deep(.uni-easyinput--border) {
  border: none !important;
}

:deep(.is-input-focus) {
  box-shadow: none !important;
}
</style> 