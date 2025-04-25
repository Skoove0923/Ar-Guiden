<template>
  <view class="layout-container">
    <!-- 顶部导航栏 -->
    <view class="layout-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-content">
        <text class="title">{{ title }}</text>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="layout-content">
      <slot></slot>
    </view>

    <!-- 底部导航栏 -->
    <view class="layout-tabbar" v-if="showTabBar">
      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index, item.path)"
      >
        <view class="icon-container">
          <text class="tab-icon">{{ item.icon }}</text>
        </view>
        <text class="tab-text">{{ item.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '首页'
  },
  showTabBar: {
    type: Boolean,
    default: true
  }
})

const statusBarHeight = ref(0)
const currentTab = ref(0)

const tabList = [
  { text: '首页', icon: '🏠', path: '/pages/home/home' },
  { text: '新闻', icon: '📋', path: '/pages/News/index' },
  { text: '消息', icon: '💬', path: '/pages/message/index' },
  { text: '我的', icon: '👤', path: '/pages/profile/profile' }
]

onMounted(() => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 根据当前页面路径初始化活动标签
  initActiveTab()
})

// 初始化活动标签
const initActiveTab = () => {
  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentPath = '/' + currentPage.route
  
  // 查找匹配的标签索引
  const index = tabList.findIndex(item => {
    // 完全匹配或者路径前缀匹配（处理子路径的情况）
    return item.path === currentPath || currentPath.startsWith(item.path + '/')
  })
  
  // 如果找到匹配的标签，设置为当前活动标签
  if (index !== -1) {
    currentTab.value = index
  }
}

const switchTab = (index, path) => {
  // 如果点击当前激活的tab，不做任何操作
  if (currentTab.value === index) return
  
  currentTab.value = index
  
  // 获取当前页面路径
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const currentPath = '/' + currentPage.route
  
  // 如果当前页面与目标页面不同，则进行跳转
  if (currentPath !== path) {
    // 使用switchTab或navigateTo跳转到相应页面
    uni.switchTab({
      url: path,
      fail: () => {
        // 如果switchTab失败，尝试使用navigateTo
        uni.navigateTo({
          url: path,
          fail: (err) => {
            console.error('页面跳转失败:', err)
            // 如果navigateTo也失败，尝试使用redirectTo
            uni.redirectTo({
              url: path,
              fail: () => {
                uni.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                })
              }
            })
          }
        })
      }
    })
  }
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.layout-header {
  background: linear-gradient(135deg, #76daff, #49c5b6);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(73, 197, 182, 0.15);
}

.header-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.layout-content {
  flex: 1;
  margin-top: calc(44px + var(--status-bar-height) - 25px);
  margin-bottom: 50px;
  background-color: #f7fbfc;
}

.layout-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 52px;
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5px 0;
  transition: all 0.3s ease;
}

.icon-container {
  width: 36px;
  height: 36px;
  background-color: #f7f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab-icon {
  font-size: 18px;
  transition: all 0.3s ease;
}

.tab-text {
  font-size: 12px;
  color: #78909c;
  transition: all 0.3s ease;
  margin-top: 4px;
}

.tab-item.active {
  transform: translateY(-2px);
}

.tab-item.active .tab-text {
  color: #49c5b6;
  font-weight: 500;
}

.tab-item.active .icon-container {
  transform: scale(1.1);
  background: linear-gradient(135deg, rgba(118, 218, 255, 0.2), rgba(73, 197, 182, 0.2));
  box-shadow: 0 4px 10px rgba(73, 197, 182, 0.15);
}
</style> 