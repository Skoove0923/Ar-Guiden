<template>
    <layout title="我的评论">
        <view class="comments-container">
            <!-- 评论列表 -->
            <view class="comment-list">
                <view 
                    v-for="(item, index) in commentList" 
                    :key="index"
                    class="comment-item"
                    @click="navigateToNews(item.newsId)"
                >
                    <view class="comment-content">
                        <text class="comment-text">{{ item.comment }}</text>
                        <text class="news-title">回复：{{ item.newsTitle }}</text>
                    </view>
                    <view class="comment-footer">
                        <text class="comment-time">{{ formatTime(item.commentDate) }}</text>
                        <view class="comment-actions">
                            <view class="action-item">
                                <text class="action-icon">❤️</text>
                                <text class="action-count">{{ item.likes || 0 }}</text>
                            </view>
                            <view class="action-item delete" @click.stop="deleteComment(item)">
                                <text class="action-icon">🗑️</text>
                                <text class="action-text">删除</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-if="!commentList.length" class="empty-state">
                <text class="empty-text">还没有发表过评论哦~</text>
            </view>
        </view>
    </layout>
</template>

<script setup lang="ts">
import Layout from '@/layout/index.vue'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import news from '@/api/news'
import comments from '@/api/comments'

const userStore = useUserStore()
const commentList = ref([])

// 获取用户评论列表
const getUserComments = async () => {
    try {
        const res = await comments.getComentsByUserId(userStore.userInfo.id)
        if (res.data.code === 100200) {
            const commentData = res.data.data.records
            // 获取每条评论对应的新闻信息
            const commentsWithNews = await Promise.all(
                commentData.map(async (comment: any) => {
                    try {
                        const newsRes = await news.getNewsDetail(comment.newsId)
                        return {
                            ...comment,
                            newsTitle: newsRes.data.records[0].summary || '原文已删除'
                        }
                    } catch (error) {
                        console.error('获取新闻信息失败:', error)
                        return {
                            ...comment,
                            newsTitle: '原文已删除'
                        }
                    }
                })
            )
            commentList.value = commentsWithNews
        }
    } catch (error) {
        console.error('获取评论失败:', error)
        uni.showToast({
            title: '获取评论失败',
            icon: 'error'
        })
    }
}

// 删除评论
const deleteComment = async (comment: any) => {
    uni.showModal({
        title: '提示',
        content: '确定要删除这条评论吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    const result = await comments.delComment(comment.id)
                    if (result.data.code === 100200) {
                        uni.showToast({
                            title: '删除成功',
                            icon: 'success'
                        })
                        getUserComments() // 重新获取评论列表
                    }
                } catch (error) {
                    uni.showToast({
                        title: '删除失败',
                        icon: 'error'
                    })
                }
            }
        }
    })
}

// 跳转到新闻详情
const navigateToNews = (newsId: any) => {
    uni.navigateTo({
        url: `/pages/News/NewsDetail/index?id=${newsId}`
    })
}

// 格式化时间
    const formatTime = (timeStr: any) => {
    const date = new Date(timeStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
    getUserComments()
})
</script>

<style scoped>
.comments-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 15px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.comment-item {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comment-content {
    margin-bottom: 12px;
}

.comment-text {
    font-size: 15px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 8px;
    display: block;
}

.news-title {
    font-size: 13px;
    color: #666;
    display: block;
    background: #f8f8f8;
    padding: 8px 12px;
    border-radius: 6px;
    margin-top: 8px;
}

.comment-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
}

.comment-time {
    font-size: 12px;
    color: #999;
}

.comment-actions {
    display: flex;
    gap: 15px;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.action-icon {
    font-size: 14px;
}

.action-count, .action-text {
    font-size: 12px;
    color: #999;
}

.delete {
    color: #ff6b6b;
}

.delete .action-text {
    color: #ff6b6b;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
}

.empty-text {
    font-size: 14px;
    color: #999;
    text-align: center;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .comments-container {
        background-color: #1f1f1f;
    }
    
    .comment-item {
        background: #2d2d2d;
    }
    
    .comment-text {
        color: #fff;
    }
    
    .news-title {
        background: #3d3d3d;
        color: #ccc;
    }
}
</style>
