<template>
    <view class="avatar-section">
        <text class="section-title">头像</text>
        <view class="avatar-wrapper" @click="handleAvatarChange">
            <Avatar :src="modelValue" :size="100" />
            <text class="change-text">点击更换头像</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Avatar from '@/pages/index/component/Avatar.vue'
import user from '@/api/user'

const props = defineProps<{
    modelValue: string
    userId: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

// 更换头像
const handleAvatarChange = async () => {
    try {
        // 显示上传中提示
        uni.showLoading({
            title: '上传中...'
        })
        
        // 上传头像
        const uploadResult = await user.uploadAvatar('', props.userId)
        
        if (uploadResult.code === 100200) {
            const imageUrl = uploadResult.data.image || uploadResult.data.url
            if (!imageUrl) {
                throw new Error('未获取到图片地址')
            }

            // 更新父组件的值
            emit('update:modelValue', imageUrl)

            uni.hideLoading()
            uni.showToast({
                title: '头像更新成功',
                icon: 'success'
            })
        } else {
            throw new Error(uploadResult.msg || '头像上传失败')
        }
    } catch (error) {
        console.error('头像上传失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: error instanceof Error ? error.message : '头像上传失败',
            icon: 'error'
        })
    }
}
</script>

<style scoped>
.avatar-section {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 15px;
}

.section-title {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    margin-bottom: 15px;
}

.avatar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.change-text {
    font-size: 14px;
    color: #999;
}

/* 头像悬停效果 */
.avatar-wrapper:active {
    opacity: 0.8;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .avatar-section {
        background: #2d2d2d;
    }
    
    .section-title {
        color: #fff;
    }
    
    .change-text {
        color: #666;
    }
}
</style> 