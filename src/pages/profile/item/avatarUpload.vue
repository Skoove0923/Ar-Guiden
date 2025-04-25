<template>
    <layout title="更换头像">
        <view class="avatar-page">
            <!-- 预览区域 -->
            <view class="preview-section">
                <text class="section-title">头像预览</text>
                <view class="preview-wrapper">
                    <Avatar :src="currentAvatar" :size="120" />
                </view>
            </view>

            <!-- 操作按钮 -->
            <view class="action-section">
                <button class="upload-btn" @click="handleChooseImage">选择图片</button>
            </view>
        </view>
    </layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Layout from '@/layout/index.vue'
import Avatar from '@/pages/index/component/Avatar.vue'
import { useUserStore } from '@/store/user'
import user from '@/api/user'

const userStore = useUserStore()
const currentAvatar = ref(userStore.userInfo.image || '')
const originalAvatar = userStore.userInfo.image || ''

// 判断是否有修改
const hasChanged = computed(() => currentAvatar.value !== originalAvatar)

onMounted(async () => {
    
})
// 选择图片
const handleChooseImage = async () => {
    try {
        // 显示上传中提示
        uni.showLoading({
            title: '上传中...'
        })
        
        // 上传头像
        const uploadResult = await user.uploadAvatar('', userStore.userInfo.id)
        
        if (uploadResult.code === 100200) {
            const imageUrl = uploadResult.data.image || uploadResult.data.url
            if (!imageUrl) {
                throw new Error('未获取到图片地址')
            }

            const userRef = await user.getUserInfo()
            // 更新预览
            currentAvatar.value = userRef.data.image
            userStore.setUserInfo(userRef.data)
            uni.hideLoading()
            uni.showToast({
                title: '上传成功',
                icon: 'success'
            })
        } else {
            throw new Error(uploadResult.msg || '上传失败')
        }
    } catch (error) {
        console.error('上传失败:', error)
        uni.hideLoading()
        uni.showToast({
            title: error instanceof Error ? error.message : '上传失败',
            icon: 'error'
        })
    }
}

// 保存修改

</script>

<style scoped>
.avatar-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 15px;
}

.preview-section {
    background: #fff;
    padding: 30px 20px;
    border-radius: 12px;
    margin-bottom: 20px;
}

.section-title {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    margin-bottom: 30px;
    text-align: center;
}

.preview-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.action-section {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.upload-btn, .save-btn {
    width: 100%;
    height: 44px;
    line-height: 44px;
    border-radius: 22px;
    font-size: 16px;
    border: none;
}

.upload-btn {
    background: #f8f8f8;
    color: #333;
}

.save-btn {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    color: #fff;
}

.save-btn[disabled] {
    opacity: 0.5;
    background: #ccc;
}

.upload-btn:active, .save-btn:active {
    opacity: 0.8;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .avatar-page {
        background-color: #1f1f1f;
    }
    
    .preview-section, .action-section {
        background: #2d2d2d;
    }
    
    .section-title {
        color: #fff;
    }
    
    .upload-btn {
        background: #3d3d3d;
        color: #fff;
    }
}
</style> 