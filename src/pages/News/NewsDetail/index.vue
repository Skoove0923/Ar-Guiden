<template>
  <layout title="新闻详情">
    <view class="detail-container">
      <view class="news-header">
        <text class="news-title">{{ newsDetail.summary }}</text>
      </view>
      
      <view class="news-content">
        <!-- 第一段文字 -->
        <view class="content-section">
          <text class="news-text">{{ contentParts[0] }}</text>
        </view>
        
        <!-- 第一张图片 -->
        <view v-if="newsDetail.image1" class="image-section">
          <image :src="newsDetail.image1" mode="aspectFill" class="news-image"/>
        </view>
        
        <!-- 第二段文字 -->
        <view v-if="contentParts[1]" class="content-section">
          <text class="news-text">{{ contentParts[1] }}</text>
        </view>
        
        <!-- 第二张图片 -->
        <view v-if="newsDetail.image2" class="image-section">
          <image :src="newsDetail.image2" mode="aspectFill" class="news-image"/>
        </view>
        
        <!-- 第三段文字 -->
        <view v-if="contentParts[2]" class="content-section">
          <text class="news-text">{{ contentParts[2] }}</text>
        </view>
        
        <!-- 第三张图片 -->
        <view v-if="newsDetail.image3" class="image-section">
          <image :src="newsDetail.image3" mode="aspectFill" class="news-image"/>
        </view>
        
        <!-- 剩余文字 -->
        <view v-if="contentParts[3]" class="content-section">
          <text class="news-text">{{ contentParts[3] }}</text>
        </view>
      </view>

      <view class="news-actions">
        <view class="action-item" @click="toggleLike(newsDetail)">
          <text class="action-icon" :class="{ 'liked': isLiked }">
            {{ isLiked ? '❤️' : '🤍' }}
          </text>
          <text class="action-count">{{ newsDetail.likes || 0 }}</text>
        </view>
        <view class="action-item">
          <text class="action-icon">💬</text>
          <text class="action-count">{{ newsDetail.comments || 0 }}</text>
        </view>
      </view>

      <!-- 添加评论组件 -->
      <comment v-if="newsId" :newsId="newsId" />
    </view>
  </layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Layout from '@/layout/index.vue'
import Comment from './component/comment/index.vue'
import news from '@/api/news'

const newsDetail = ref({})
const newsId = ref(null)
const isLiked = ref(false)

// 将内容分割成多个部分
const contentParts = computed(() => {
  if (!newsDetail.value.content) return []
  // 根据句号或分号分割内容
  const parts = newsDetail.value.content.split(/[。；]/).filter(Boolean)
  // 确保至少有4个部分
  while (parts.length < 4) {
    parts.push('')
  }
  return parts.map(part => part.trim() + '。')
})

// 检查点赞状态
const checkLikeStatus = (id) => {
  isLiked.value = news.getLikeStatus(id)
}

// 切换点赞状态
const toggleLike = async(item) => {
  if (!item.id) {
    console.error('新闻ID不存在')
    return
  }
  
  try {
    const newLikes = isLiked.value ? (item.likes - 1) : (item.likes + 1)
    const updateData = {
      id: Number(item.id),
      likes: newLikes,
      
      image1: item.image1,
      image2: item.image2,
      image3: item.image3
    }
    
    const res = await news.updateNewsContentI(updateData)
    
    if (res.data.code === 100200) {
      item.likes = newLikes
      isLiked.value = !isLiked.value
      news.setLikeStatus(item.id, isLiked.value)
      
    } else {
      throw new Error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  }
}

// 获取新闻详情的方法
const getDetail = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage.options?.id
  
  if (id) {
    newsId.value = id
    checkLikeStatus(id)  // 获取点赞状态
    news.getNewsDetail(id).then(res => {
      newsDetail.value = res.data.records[0]
    })
  }
}

// 使用 onShow 代替 onMounted
uni.$on('onShow', () => {
  getDetail()
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  uni.$off('onShow')
})

// 首次加载也需要获取数据
onMounted(() => {
  getDetail()
})
</script>

<style scoped>
.detail-container {
  padding: 20px;
}

.news-header {
  margin-bottom: 20px;
}

.news-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.news-content {
  margin-bottom: 20px;
}

.content-section {
  margin: 12px 0;
  line-height: 1.6;
}

.news-text {
  font-size: 16px;
  color: #333;
  text-align: justify;
}

.image-section {
  margin: 15px 0;
  display: flex;
  justify-content: center;
}

.news-image {
  width: 100%;
  height: 200px; /* 固定高度 */
  border-radius: 8px;
  object-fit: cover; /* 保持图片比例并填充容器 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media screen and (min-width: 768px) {
  .news-image {
    width: 80%; /* 在大屏幕上限制图片宽度 */
    max-width: 600px;
  }
}

.news-actions {
  display: flex;
  gap: 20px;
  padding: 15px 0;
  margin-top: 30px;
  border-top: 1px solid #eee;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.action-icon.liked {
  transform: scale(1.2);
}

.action-count {
  font-size: 14px;
  color: #999;
}
</style>