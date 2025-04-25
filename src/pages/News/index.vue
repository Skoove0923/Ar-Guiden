<template>
  <layout title="新闻">
    <view class="news-container">
      <view class="news-list">
        <uni-card 
          v-for="(item, index) in Newsdata" 
          :key="index" 
          class="news-card"
         @click="navigateToDetail(item.id)"
        >
          <view class="news-content">
            <image v-if="item.image1" :src="item.image1" mode="aspectFill" class="news-image" />
            <view class="news-info" >
              <text class="news-title">{{ item.summary }}</text>
              <view class="news-actions">
                <view class="action-item">
          <text class="action-icon" :class="{ 'liked': isLiked }">
            {{ isLiked ? '❤️' : '🤍' }}
          </text>
          <text class="action-count">{{ item.likes || 0 }}</text>
        </view>
                <view class="action-item">
                  <text class="action-icon">💬</text>
                  <text class="action-count">{{ item.comments || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </uni-card>
      </view>
    </view>
  </layout>
</template>

<script setup>
import Layout from '@/layout/index.vue'
import news from '@/api/news'
import { onMounted, ref } from 'vue'

const Newsdata = ref([])
const isLiked = ref(false)

onMounted(() => {
  news.getNewsList().then(res => {
    Newsdata.value = res.data
    console.log(res.data)
  })
})
// 检查点赞状态
const checkLikeStatus = (id) => {
  isLiked.value = news.getLikeStatus(id)
}
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


const navigateToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/News/NewsDetail/index?id=${id}`
  })
}

</script>

<style scoped>
.news-container {
  padding: 15px;
}

.news-card {
  margin-bottom: 15px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.news-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.news-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  flex-shrink: 0;
  object-fit: cover;
}

.news-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90px;
}

.news-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  margin-bottom: auto;
}

.news-actions {
  display: flex;
  gap: 15px;
  padding-top: 8px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-icon {
  font-size: 14px;
}

.action-count {
  font-size: 12px;
  color: #999;
}

.news-text {
  margin-bottom: 12px;
}

.news-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.news-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}
</style>

