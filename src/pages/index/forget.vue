<template>
  <view class="login-container">
    <view class="login-card">
      <view class="card-header">
        <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
        
        <view class="fire-container" @click="toggleFireState">
          <view class="fire-center" :class="{ 'extinguished': isFireOut }"></view>
          <view class="fire fire-red" :class="{ 'extinguished': isFireOut }"></view>
          <view class="fire fire-orange" :class="{ 'extinguished': isFireOut }"></view>
          <view class="fire fire-yellow" :class="{ 'extinguished': isFireOut }"></view>
          <view v-if="isWaterDropVisible" class="water-drop"></view>
          <view v-if="isWaterSplashVisible" class="water-splash"></view>
          <view v-if="isFireOut" class="smoke"></view>
        </view>
        
        <text class="welcome">忘记密码</text>
      </view>
      
      <uni-forms :model="formState" ref="form" class="login-form">
        <view class="input-group">
          <view class="input-icon">
            <uni-icons type="email" size="20" color="#8a8a8a"></uni-icons>
          </view>
          <uni-easyinput
            v-model="formState.username"
            placeholder="请输入邮箱"
            class="custom-input"
          />
        </view>
        <button class="login-btn1" @click="onFinish">发送验证码</button>
        <view class="input-group">
            <view class="input-icon">
                <uni-icons type="locked" size="20" color="#8a8a8a"></uni-icons>
            </view>
          <uni-easyinput
            placeholder="请输入验证码"
            class="custom-input"
          />
        </view>

        <button class="login-btn" @click="openModal">重置密码</button>

        <view class="help-links">
          <text class="help-text" @click="toLogin">返回登录</text>
          <text class="help-text signup" @click="toRegister">创建新账户</text>
        </view>
      </uni-forms>

        <view>
			<!-- 输入框示例 -->
			<uni-popup ref="inputDialog" type="dialog">
                <view>  
                    <uni-popup-dialog 
                    ref="inputClose"  
                    mode="input" 
                    title="新密码" 
                    class="modal-title"
                    placeholder="请输入新密码"
                     @confirm="dialogInputConfirm"></uni-popup-dialog>
                </view>
			</uni-popup>
		</view>

    </view>
  </view>
</template>

<script setup >
import { reactive, ref } from 'vue'
import user from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const isFireOut = ref(false)
const isWaterDropVisible = ref(false)
const isWaterSplashVisible = ref(false)

const formState = reactive({
  username: '',
  password: '',
})

// 创建对弹窗的引用
const inputDialog = ref(null)

const toggleFireState = () => {
  if (!isFireOut.value) {
    isWaterDropVisible.value = true
    
    // 水滴下落到一半时显示水花飞溅
    setTimeout(() => {
      isWaterSplashVisible.value = true
    }, 300)
    
    // 水滴落到火焰上后灭火
    setTimeout(() => {
      isFireOut.value = true
      isWaterDropVisible.value = false
      
      // 短暂延迟后隐藏水花
      setTimeout(() => {
        isWaterSplashVisible.value = false
      }, 300)
    }, 500)
    
    // 5秒后火焰重新点燃
    setTimeout(() => {
      isFireOut.value = false
    }, 5000)
  }
}

const toRegister = () => {
  uni.navigateTo({ url: '/pages/index/register' });
}


const toLogin = () => {
  uni.navigateTo({ url: '/pages/index/login' });
}
const openModal = () => {
  inputDialog.value.open()
}

const dialogInputConfirm = (val) => {
  // 处理确认逻辑
  console.log('对话框输入值:', val)
}

const onFinish = async() => {
  try {
    const res = await user.login(formState.username, formState.password);
    if (res.data.code===100200) {
      userStore.setToken(res.data.data)
      // 等待获取用户信息完成
      const userInfoRes = await userStore.getUserInfo()
      console.log(userInfoRes);
      sessionStorage.setItem('userInfo', JSON.stringify(userInfoRes.data))
      if (userInfoRes.code === 100200) {
        uni.showToast({ title: '登录成功！', icon: 'success' });
        uni.navigateTo({ url: '/pages/home/home' });
      } else {
        uni.showToast({ title: '获取用户信息失败', icon: 'none' });
      }
    } else {
      uni.showToast({ title: res.data.message || '登录失败', icon: 'none' });
    }
  } catch (error) {
    console.error(error);
    uni.showToast({ title: '登录失败，请检查网络连接', icon: 'none' });
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #76daff, #49c5b6);
  padding: 20px;
}

.login-card {
  width: 90%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.login-card::before {
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

.login-card::after {
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
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}
.login-btn1 {
  width: 35%;
  height: 35px;
  background: #49c5b6;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  position: relative;
  margin-left: 65%;
  overflow: hidden;
  margin-bottom: 10px;
}
.custom-input1 {
  width: 50%;
  height: 40px;
  color: #fff;
  border: none;
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

.login-form {
  position: relative;
  z-index: 1;
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

.login-btn {
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

.login-btn:active {
  transform: scale(0.98);
  background: linear-gradient(135deg, #5ac7d5, #3eb6a7);
}

.help-links {
  display: flex;
  justify-content: space-between;
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

.social-login {
  margin-top: 40px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.social-title {
  position: relative;
  display: inline-block;
  padding: 0 15px;
  color: #90a4ae;
  font-size: 12px;
  background: #fff;
}

.social-title::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  width: 50px;
  height: 1px;
  background: #e0f7fa;
}

.social-title::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  width: 50px;
  height: 1px;
  background: #e0f7fa;
}

.social-icons {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.social-icon {
  width: 45px;
  height: 45px;
  background: #f5f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(73, 197, 182, 0.2);
}

/* 火焰动画样式 */
.fire-container {
  width: 80px;
  height: 80px;
  position: relative;
  margin: 10px auto ;
}

.fire-center {
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 50%;
  background-color: #ff3c00;
  border-radius: 50% 50% 20% 20%;
  box-shadow: 0 0 15px 10px rgba(255, 60, 0, 0.4);
  animation: burn 1.5s infinite alternate;
}

.fire {
  position: absolute;
  bottom: 0;
  left: 10%;
  width: 80%;
  height: 80%;
  border-radius: 50% 50% 20% 20%;
  transform-origin: 50% 85%;
  opacity: 0.8;
  animation: flicker 1.5s infinite alternate;
}

.fire-red {
  background-color: #ff4500;
  z-index: 4;
  animation-delay: 0.1s;
}

.fire-orange {
  background-color: #ff7800;
  z-index: 3;
  height: 90%;
  animation-delay: 0.2s;
}

.fire-yellow {
  background-color: #ffcf00;
  z-index: 2;
  height: 60%;
  animation-delay: 0.3s;
}

@keyframes flicker {
  0% {
    transform: skewX(5deg) scaleY(1);
    opacity: 0.7;
  }
  25% {
    transform: skewX(-5deg) scaleY(0.9);
    opacity: 0.8;
  }
  50% {
    transform: skewX(10deg) scaleY(1.1);
    opacity: 0.9;
  }
  75% {
    transform: skewX(-10deg) scaleY(0.95);
    opacity: 0.7;
  }
  100% {
    transform: skewX(5deg) scaleY(1.05);
    opacity: 0.8;
  }
}

@keyframes burn {
  0% {
    box-shadow: 0 0 10px 5px rgba(255, 60, 0, 0.3);
  }
  100% {
    box-shadow: 0 0 15px 10px rgba(255, 60, 0, 0.5);
  }
}

/* 火焰熄灭状态 */
.fire.extinguished {
  transform: scaleY(0.1) scaleX(1.5) !important;
  opacity: 0 !important;
  transition: all 0.3s ease-out;
}

.fire-center.extinguished {
  background-color: #555 !important;
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.1) !important;
  transform: scaleY(0.3) scaleX(1.5);
  transition: all 0.3s ease-out;
}

/* 水滴动画 */
.water-drop {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 30px;
  background-color: #76daff;
  border-radius: 50% 50% 50% 50%;
  opacity: 0.9;
  animation: drop 0.5s ease-in forwards;
  z-index: 10;
  box-shadow: 0 0 10px 2px rgba(118, 218, 255, 0.5);
}

/* 烟雾效果 */
.smoke {
  position: absolute;
  bottom: 10px;
  left: 20%;
  width: 60%;
  height: 40px;
  border-radius: 20px;
  background: rgba(200, 200, 200, 0.6);
  animation: smoking 4s ease-out infinite;
  opacity: 0;
}

/* 水滴掉落动画 */
@keyframes drop {
  0% {
    top: -30px;
    height: 30px;
    width: 20px;
    opacity: 1;
  }
  50% {
    height: 35px;
    width: 22px;
    opacity: 1;
  }
  80% {
    height: 15px;
    width: 40px;
    opacity: 0.8;
  }
  100% {
    top: 50%;
    height: 10px;
    width: 60px;
    opacity: 0;
    border-radius: 50%;
  }
}

/* 烟雾动画 */
@keyframes smoking {
  0% {
    bottom: 10px;
    opacity: 0;
    width: 40%;
    transform: translateX(0);
  }
  10% {
    opacity: 0.8;
  }
  40% {
    opacity: 0.6;
    transform: translateX(-5px);
  }
  60% {
    width: 50%;
    transform: translateX(5px);
  }
  80% {
    opacity: 0.4;
  }
  100% {
    bottom: 80px;
    opacity: 0;
    width: 70%;
    transform: translateX(0);
  }
}

/* 水花飞溅效果 */
.water-splash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 20px;
  z-index: 11;
}

.water-splash::before,
.water-splash::after {
  content: '';
  position: absolute;
  background-color: #76daff;
  opacity: 0.7;
  border-radius: 50%;
  animation: splash 0.5s ease-out forwards;
}

.water-splash::before {
  width: 10px;
  height: 10px;
  left: 0;
  top: 5px;
}

.water-splash::after {
  width: 8px;
  height: 8px;
  right: 0;
  top: 7px;
}

.water-splash::before {
  animation-name: splash-left;
}

.water-splash::after {
  animation-name: splash-right;
}

@keyframes splash-left {
  0% {
    left: 50%;
    top: 50%;
    opacity: 0.9;
    width: 8px;
    height: 8px;
  }
  100% {
    left: -5px;
    top: -10px;
    width: 12px;
    height: 12px;
    opacity: 0;
  }
}

@keyframes splash-right {
  0% {
    right: 50%;
    top: 50%;
    opacity: 0.9;
    width: 8px;
    height: 8px;
  }
  100% {
    right: -5px;
    top: -10px;
    width: 12px;
    height: 12px;
    opacity: 0;
  }
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
