<template>
  <view class="comment-section">
    <!-- 评论输入框 -->
    <view class="comment-input-box">
      <input 
        v-model="commentText"
        class="comment-input"
        placeholder="写下你的评论..."
        @confirm="submitComment"
      />
      <button class="submit-btn" @click="submitComment">发送</button>
    </view>

    <!-- 评论列表 -->
    <view class="comment-list">
      <view 
        v-for="(item, index) in commentList" 
        :key="index"
        class="comment-item"
      >
        <view class="comment-user">
          <image 
            :src="item.userInfo?.image || '/static/default-avatar.png'" 
            class="user-avatar"
          />
          <view class="user-info">
            <text class="username">{{ item.userInfo?.name || '未知用户' }}</text>
            <text class="comment-time">{{ item.commentDate }}</text>
          </view>
        </view>
        <view class="comment-content">
          <text>{{ item.comment }}</text>
        </view>
        <view class="comment-actions">
          <view class="action" @click="likeComment(item)">
            <text class="action-icon" :class="{ 'liked': item.isLiked }">
              {{ item.isLiked ? '❤️' : '🤍' }}
            </text>
            <text class="action-count">{{ item.likes || 0 }}</text>
          </view>
          <view class="action-group">
            <view 
              class="action delete-action" 
              v-if="item.userId === userInfo.id" 
              @click.stop="deleteComment(item)"
            >
              <text class="action-icon">🗑️</text>
              <text class="action-text">删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import news from '@/api/news'
import comments from '@/api/comments'
import user from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const userInfo = ref(userStore.userInfo)

const props = defineProps({
  newsId: {
    type: [String, Number],
    required: true
  }
})

const commentText = ref('')
const commentList = ref([])

// 获取评论列表时同时初始化点赞状态和用户信息
const getCommentList = async(id) => {
  const res = await news.getComment(id)
  // 为每条评论添加点赞状态，并按时间倒序排列
  const comments = res.data.records
    .map(comment => ({
      ...comment,
      isLiked: news.getCommentLikeStatus(comment.id),
      userInfo: null, // 初始化用户信息为 null
      commentDate: formatTime(comment.commentDate) // 格式化时间显示
    }))
    .sort((a, b) => {
      // 将时间字符串转换为时间戳进行比较
      return new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime()
    })
  
  commentList.value = comments
  
  // 获取每条评论的用户信息
  for (const comment of commentList.value) {
    try {
      const userRes = await user.getUserInfoByPath(comment.userId)
      if (userRes.data.code === 100200) {
        comment.userInfo = userRes.data.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
}

// 格式化时间显示
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
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
  // 小于30天
  if (diff < 2592000000) {
    return `${Math.floor(diff / 86400000)}天前`
  }
  // 大于30天显示具体日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 检查评论点赞状态
const isCommentLiked = (commentId) => {
  return news.getCommentLikeStatus(commentId)
}

// 点赞评论
const likeComment = async (comment) => {
  if (!comment.id) {
    console.error('评论ID不存在')
    return
  }
  
  try {
    const isLiked = isCommentLiked(comment.id)
    const newLikes = isLiked ? (comment.likes - 1) : (comment.likes + 1)
    
    const res = await news.updateCommentLikes(comment.id, newLikes)
    
    if (res.data.code === 100200) {
      comment.likes = newLikes
      // 更新本地存储和评论的点赞状态
      const newStatus = !isLiked
      news.setCommentLikeStatus(comment.id, newStatus)
      comment.isLiked = newStatus
    } else {
      throw new Error(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('点赞失败:', error)
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  }
}

// 回复评论
const replyComment = (comment) => {
  // TODO: 显示回复输入框
  console.log('回复评论:', comment)
}

onMounted(() => {
  getCommentList(props.newsId)
})

// 提交评论
const submitComment = async () => {
  if (!commentText.value.trim()) {
    uni.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }
  
  // TODO: 调用后端接口提交评论
  const res = await comments.addComment(
    {
      newsId: props.newsId,
      comment: commentText.value,
      userId: userInfo.value.id,
      comment_date: new Date().toISOString()
    }
  );
  console.log(res)
  if (res.data.code === 100200) {
    getCommentList(props.newsId)
    commentText.value = ''
  }
}

// 删除评论
const deleteComment = async (comment) => {
  const res = await comments.delComment(comment.id)
  console.log(res)
  if (res.data.code === 100200) {
    getCommentList(props.newsId)
  }
}
</script>

<style scoped>
.comment-section {
  padding: 20px;
  background: #fff;
}

.comment-input-box {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-input {
  flex: 1;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #eee;
  border-radius: 20px;
  font-size: 14px;
}

.submit-btn {
  width: 80px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
  color: #fff;
  border-radius: 20px;
  font-size: 14px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #eee;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.comment-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 8px 0;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.action-group {
  display: flex;
  gap: 15px;
}

.action {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.action:active {
  transform: scale(0.95);
}

.delete-action {
  color: #ff6b6b;
}

.delete-action:hover {
  background-color: rgba(255, 107, 107, 0.1);
}

.action-icon {
  font-size: 14px;
  transition: transform 0.3s ease;
}

.action-text {
  font-size: 12px;
  color: #666;
}

.delete-action .action-text {
  color: #ff6b6b;
}

.action-icon.liked {
  transform: scale(1.2);
  color: #ff6b6b;
}

.action-count {
  font-size: 12px;
  color: #999;
}
</style>