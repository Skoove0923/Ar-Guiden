<template>
  <layout title="智慧消防">
    <!-- 轮播图区域 -->
    <view class="swiper-container">
      <swiper 
        class="swiper" 
        circular 
        :indicator-dots="true" 
        :autoplay="true" 
        :interval="3000" 
        :duration="1000"
        indicator-color="rgba(255, 255, 255, 0.6)"
        indicator-active-color="#ffffff"
      >
        <swiper-item v-for="(item, index) in bannerList" :key="index">
          <view class="swiper-item">
            <image :src="item.image" mode="widthFix" class="swiper-image" @click="handleBannerClick(item)"/>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="home-container">
      <!-- 欢迎区域 -->
      <view class="header">
        <text class="welcome">欢迎回来</text>
        <view class="user-info">
          <image 
            :src="userInfo.image" 
            class="avatar" 
            mode="aspectFill"
          />
          <text class="username">{{ userInfo.name }}</text>
        </view>
        <!-- 紧急火警按钮 -->
        <view class="emergency-btn" @click="handleEmergency">
          <view class="fire-container">
            <view class="fire-center"></view>
            <view class="fire fire-red"></view>
            <view class="fire fire-orange"></view>
            <view class="fire fire-yellow"></view>
          </view>
          <text>紧急火警</text>
        </view>
      </view>

      <!-- 功能区域 -->
      <view class="content">
        <uni-card class="card" :border="false" :shadow="false">
          <view class="card-header">
            <text class="card-title">快捷功能</text>
          </view>
          <view class="grid">
            <view class="grid-item" v-for="(item, index) in quickActions" :key="index" @click="handleAction(item)">
              <view class="grid-icon-container">
                <view class="grid-icon-bg" :style="{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}30)`, boxShadow: `0 4px 10px ${item.color}20` }">
                  <image :src="item.iconSrc" mode="aspectFit" class="grid-icon-img" />
                </view>
              </view>
              <text class="grid-text">{{ item.name }}</text>
            </view>
          </view>
        </uni-card>
      </view>
      <!-- 今日推荐模块 -->
      <view class="recommend-container">
        <view class="recommend-header">
          <text class="recommend-title">今日推荐</text>
        </view>
        <view class="recommend-list">
          <view class="recommend-item" v-for="(item, index) in recommendNews" :key="index" @click="navigateToDetail(item.id)">   
            <image :src="item.image1" mode="aspectFill" class="recommend-image" />
            <view class="recommend-info">
              <text class="recommend-title">{{ item.summary }}</text>
              <view class="recommend-meta">
                <view class="meta-item">
                  <text class="meta-icon">🤍</text>
                  <text class="meta-text">{{ item.likes || 0 }}</text>
                </view>
                <view class="meta-item">
                  <text class="meta-icon">💬</text>
                  <text class="meta-text">{{ item.comments || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

    </view>
  </layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '@/layout/index.vue'
import user from '@/api/user'
import { useUserStore } from '@/store/user'
import news from '@/api/news'

const userStore = useUserStore()
const recommendNews = ref([])
const username = ref('')
const userInfo = ref({
  username: '',
  name: '',
  password: '',
  image: '',
  id: 0
})

const quickActions = ref([
  { 
    name: '消防新闻', 
    iconSrc: '/static/icons/news-icon.svg', 
    action: 'function1',
    path:'/pages/News/index',
    color: '#49c5b6'
  },
  { 
    name: '消防知识竞赛', 
    iconSrc: '/static/icons/quiz-icon.svg', 
    action: 'function2',
    path:'/pages/DivideAndConquer/index',
    color: '#5e97f6'
  },
  { 
    name: 'AR消防逃生', 
    iconSrc: '/static/icons/ar-icon.svg', 
    action: 'function3',
    path:'/pages/arCamera/index',
    color: '#fb8c00'
  },
  { 
    name: '消息通知', 
    iconSrc: '/static/icons/message-icon.svg', 
    action: 'function4',
    path:'/pages/message/index',
    color: '#ff7597'
  }
])

const bannerList = ref([
  { image: '../../static/lunboimage/1.png', id: 1, title: '轮播图1' },
  { image: '../../static/lunboimage/2.png', id: 2, title: '轮播图2' },
  { image: '../../static/lunboimage/3.png', id: 3, title: '轮播图3' },
  { image: '../../static/lunboimage/4.png', id: 4, title: '轮播图4' }
])

onMounted(() => {
  const token = userStore.token
  if (!token) {
    uni.redirectTo({ url: '/pages/index/login' })
  }
  userInfo.value = userStore.userInfo
  getRecommendNews()
})

const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/News/NewsDetail/index?id=${id}`
  })
}

const handleAction = (item) => {
  uni.navigateTo({
    url: item.path
  })
}

// 获取推荐新闻
const getRecommendNews = async () => {
  try {
    const res = await news.getNewsList()
    if (res.code === 100200) {
      recommendNews.value = res.data.slice(0, 3)
      console.log(recommendNews.value)
    }
  } catch (error) {
    console.error('获取推荐新闻失败:', error)
  }
}

const handleBannerClick = (item) => {
  uni.showToast({
    title: `点击了${item.title}`,
    icon: 'none'
  })
}

// 腾讯地图 key
const MAP_KEY = '67CBZ-3D2CB-SNLUV-JSYQA-FWRSO-EOFUV'

// 检查腾讯地图 SDK 是否加载
const checkMapSDK = () => {
  return new Promise((resolve, reject) => {
    // #ifdef H5
    if (window.qq && window.qq.maps) {
      resolve()
    } else {
      let checkCount = 0
      const timer = setInterval(() => {
        if (window.qq && window.qq.maps) {
          clearInterval(timer)
          resolve()
        } else if (checkCount >= 20) { // 10秒后超时
          clearInterval(timer)
          reject(new Error('地图SDK加载超时'))
        }
        checkCount++
      }, 500)
    }
    // #endif
    
    // #ifndef H5
    resolve()
    // #endif
  })
}

// 获取详细地址
const getLocationAddress = async (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    // 直接使用 JSONP 方式请求
    const script = document.createElement('script')
    const callbackName = `qq_maps_cb_${Date.now()}`
    
    // 设置超时
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('请求超时'))
    }, 5000)

    // 清理函数
    const cleanup = () => {
      delete window[callbackName]
      document.body.removeChild(script)
      clearTimeout(timeout)
    }

    // 回调处理
    window[callbackName] = (response) => {
      if (response.status === 0) {
        const address = response.result.address
        cleanup()
        resolve(address)
      } else {
        cleanup()
        reject(new Error('获取地址失败'))
      }
    }

    // 发起请求
    script.src = `https://apis.map.qq.com/ws/geocoder/v1/?key=${MAP_KEY}&location=${latitude},${longitude}&output=jsonp&callback=${callbackName}`
    script.onerror = () => {
      cleanup()
      reject(new Error('请求失败'))
    }
    document.body.appendChild(script)
  })
}

// 处理紧急情况
const handleEmergency = () => {
  uni.showLoading({
    title: '定位中...'
  })

  uni.getLocation({
    type: 'gcj02',
    success: async (res) => {
      const { latitude, longitude } = res
      console.log('获取到位置:', latitude, longitude)
      
      try {
        const location = await getLocationAddress(latitude, longitude)
        console.log('获取到地址:', location)
        
        const message = `⚠️紧急火警！
📍位置：${location}
🌍坐标：${latitude}, ${longitude}
⏰时间：${new Date().toLocaleString()}`

        uni.hideLoading()
        
        // 直接进行页面跳转
        uni.navigateTo({
          url: `/pages/message/index?target=admin&message=${encodeURIComponent(message)}`,
          success: () => {
            console.log('跳转成功')
          },
          fail: (err) => {
            console.error('页面跳转失败:', err)
            // 如果跳转失败，尝试重定向
            uni.redirectTo({
              url: `/pages/message/index?target=admin&message=${encodeURIComponent(message)}`,
              fail: () => {
                uni.showToast({
                  title: '跳转失败，请重试',
                  icon: 'none'
                })
              }
            })
          }
        })
      } catch (error) {
        console.error('获取地址失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: error.message || '获取位置信息失败',
          icon: 'none',
          duration: 2000
        })
      }
    },
    fail: (err) => {
      console.error('定位失败:', err)
      uni.hideLoading()
      uni.showToast({
        title: '定位失败，请检查定位权限',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

</script>

<style scoped>
/* 轮播图样式 */
.swiper-container {
  padding: 0 15px;
  margin-top: 10px;
}

.swiper {
  width: 100%;
  height: 480rpx;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(73, 197, 182, 0.15);
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.swiper-image {
  width: 100%;
  height: 480rpx;
  display: block;
  object-fit: cover;
}

/* 主容器样式 */
.home-container {
  padding: 15px;
  padding-top: 10px;
}

/* 欢迎区域样式 */
.header {
  background: linear-gradient(135deg, #76daff, #49c5b6);
  padding: 20px;
  border-radius: 16px;
  margin: 15px 0;
  box-shadow: 0 4px 15px rgba(73, 197, 182, 0.2);
  position: relative;
  overflow: hidden;
}

.header::before {
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

.header::after {
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

.welcome {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  display: block;
  position: relative;
  z-index: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  position: relative;
  z-index: 1;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:active {
  transform: scale(0.95);
}

.username {
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 16px;
  margin-top: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #37474f;
}

/* 网格样式 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.grid-item {
  background: #f5f9fa;
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.grid-item:active {
  background: #ffffff;
  transform: translateY(2px) scale(0.98);
  border-color: #49c5b6;
  box-shadow: 0 0 0 2px rgba(73, 197, 182, 0.15);
}

.grid-icon-container {
  margin-bottom: 12px;
  position: relative;
}

.grid-icon-bg {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  will-change: transform;
}

.grid-icon-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-item:active .grid-icon-bg::before {
  opacity: 1;
}

.grid-item:active .grid-icon-bg {
  transform: scale(0.95);
}

.grid-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.grid-text {
  font-size: 14px;
  color: #37474f;
  font-weight: 500;
  margin-top: 6px;
}

/* 推荐区域样式 */
.recommend-container {
  margin-top: 20px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.recommend-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.recommend-title {
  font-size: 16px;
  font-weight: 600;
  color: #37474f;
}

.recommend-item {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  gap: 12px;
  transition: all 0.3s ease;
}

.recommend-item:active {
  background-color: #f5f9fa;
}

.recommend-image {
  width: 110px;
  height: 80px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 80px;
}

.recommend-info .recommend-title {
  font-size: 14px;
  font-weight: 500;
  color: #37474f;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.recommend-meta {
  display: flex;
  gap: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.meta-text {
  font-size: 12px;
  color: #78909c;
}

/* 紧急按钮样式 */
.emergency-btn {
  margin-top: 15px;
  padding: 10px 20px;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  background: linear-gradient(135deg, #ff4757, #ff6b6b);
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  width: fit-content;
  margin-left: auto;
  margin-right: 15px;
}

/* 火焰容器 */
.fire-container {
  position: absolute;
  width: 30px;
  height: 30px;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.fire-center {
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 50%;
  background-color: #ff3c00;
  border-radius: 50% 50% 20% 20%;
  box-shadow: 0 0 12px 8px rgba(255, 60, 0, 0.4);
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

.emergency-btn text {
  color: white;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  margin-left: 35px;
}

/* 点击效果 */
.emergency-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(255, 71, 87, 0.2);
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
</style> 