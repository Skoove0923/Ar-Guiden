<template>
    <layout title="个人资料">
        <view class="personal-data">
            <!-- 基本信息部分 -->
            <view class="info-section">
                <view class="section-header">
                    <text class="section-title">基本信息</text>
                    <text class="section-desc">完善个人信息，让大家更好地认识你</text>
                </view>

                <view class="info-item">
                    <text class="item-label">用户名</text>
                    <input 
                        type="text" 
                        v-model="userInfo.username" 
                        class="item-input"
                        placeholder="请输入用户名"
                    />
                </view>
                
                <view class="info-item">
                    <text class="item-label">昵称</text>
                    <input 
                        type="text" 
                        v-model="userInfo.name" 
                        class="item-input"
                        placeholder="请输入昵称"
                    />
                </view>

                <view class="info-item">
                    <text class="item-label">邮箱</text>
                    <input 
                        type="text" 
                        v-model="userInfo.email" 
                        class="item-input"
                        placeholder="请输入邮箱"
                    />
                    <text class="input-tip">用于接收重要通知</text>
                </view>
            </view>

            <!-- 保存按钮 -->
            <view class="button-section">
                <button class="save-btn" @click="saveChanges">保存修改</button>
            </view>

            <!-- 添加底部安全区域 -->
            <view class="safe-area-bottom"></view>
        </view>
    </layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Layout from '@/layout/index.vue'
import { useUserStore } from '@/store/user'
import user from '@/api/user'
import AvatarUploader from '../components/AvatarUploader.vue'
import Avatar from '@/pages/index/component/Avatar.vue'

interface UserInfoState {
    id: number;
    username: string;
    name?: string;
    email?: string;
    image?: string;
}

defineOptions({
    name: 'PersonalData'
})

const userStore = useUserStore()
const userInfo = ref<UserInfoState>({
    id: userStore.userInfo.id,
    username: userStore.userInfo.username,
    name: userStore.userInfo.name || '',
    email: userStore.userInfo.email || '',
    image: userStore.userInfo.image || ''
})

// 保存修改
const saveChanges = async () => {
    try {
        if (!userInfo.value.id || !userInfo.value.username) {
            uni.showToast({
                title: '用户信息不完整',
                icon: 'error'
            })
            return
        }

        // 验证邮箱格式
        if (userInfo.value.email && !validateEmail(userInfo.value.email)) {
            uni.showToast({
                title: '邮箱格式不正确',
                icon: 'error'
            })
            return
        }

        const updateData = {
            id: userInfo.value.id,
            username: userInfo.value.username,
            name: userInfo.value.name,
            email: userInfo.value.email,
            image: userInfo.value.image
        }

        const res = await user.updateUser(updateData)
        
        if (res.data.code === 100200) {
            // 更新 store
            userStore.setUserInfo(userInfo.value)
            
            uni.showToast({
                title: '保存成功',
                icon: 'success'
            })
            
            // 延迟返回
            setTimeout(() => {
                userStore.setUserInfo(userStore.getUserInfo())
                uni.navigateBack()
            }, 1500)
        } else {
            throw new Error(res.data.msg || '更新失败')
        }
    } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
            title: error instanceof Error ? error.message : '保存失败',
            icon: 'error'
        })
    }
}

// 邮箱格式验证
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// 跳转到头像上传页面
const navigateToAvatarUpload = () => {
    uni.navigateTo({
        url: '/pages/profile/item/avatarUpload'
    })
}
</script>

<style scoped>
.personal-data {
    min-height: 100vh;
    background-color: #f7f7f7;
    padding: 20px 15px;
    /* 添加底部内边距，为按钮腾出空间 */
    padding-bottom: calc(120px + env(safe-area-inset-bottom));
}

.section-header {
    padding: 0 5px 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.section-title {
    font-size: 18px;
    color: #333;
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
}

.section-desc {
    font-size: 14px;
    color: #999;
}

.info-section {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-item {
    margin-bottom: 15px;
}

.item-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 5px;
    display: block;
}

.item-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    color: #333;
    transition: border-color 0.3s ease;
}

.item-input::placeholder {
    color: #aaa;
}

.item-input:focus {
    border-color: #f6d365;
    box-shadow: 0 0 5px rgba(246, 211, 101, 0.5);
}

.input-tip {
    font-size: 12px;
    color: #999;
}

.button-section {
    padding: 20px;
    position: sticky;
    bottom: env(safe-area-inset-bottom);
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    margin: 0 -15px;
    z-index: 100;
}

.save-btn {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    color: #fff;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(253, 160, 133, 0.3);
    cursor: pointer;
    position: relative; /* 为伪元素定位 */
}

.save-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1; /* 确保在按钮后面 */
}

.save-btn:hover::after {
    opacity: 1; /* 悬停时显示背景 */
}

.save-btn:hover {
    background: linear-gradient(135deg, #fda085 0%, #f6d365 100%);
    transform: scale(1.02);
}

.save-btn:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(253, 160, 133, 0.2);
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
    .personal-data {
        background-color: #1a1a1a;
    }
    
    .info-section {
        background: #2d2d2d;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
    
    .section-title {
        color: #fff;
    }
    
    .item-label {
        color: #fff;
    }
    
    .item-input {
        background: #3d3d3d;
        color: #fff;
    }
    
    .item-input:focus {
        border-color: #f6d365;
    }
    
    .input-tip {
        color: #666;
    }
    
    .save-btn {
        background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
    }
}

/* 添加动画效果 */
.info-section {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 底部安全区域 */
.safe-area-bottom {
    height: env(safe-area-inset-bottom);
    width: 100%;
}
</style> 