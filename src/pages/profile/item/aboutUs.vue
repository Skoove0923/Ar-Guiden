<template>
    <layout title="关于我们">
        <view class="about-container">
            <!-- Logo区域 -->
            <view class="logo-section">
                <image src="/static/logo.png" class="logo" mode="aspectFit" />
                <text class="app-name">消防安全知识</text>
                <text class="version">Version 1.0.0</text>
            </view>

            <!-- 简介区域 -->
            <view class="intro-section">
                <text class="intro-text">
                       消防安全知识APP致力于普及消防安全知识和ar出口导航，提高公众的消防安全意识。通过趣味性的答题方式，让用户在轻松的氛围中学习消防知识，掌握消防技能。
                </text>
            </view>

            <!-- 功能特点 -->
            <view class="features-section">
                <text class="section-title">主要功能</text>
                <view class="feature-list">
                    <view class="feature-item">
                        <text class="feature-icon">🎯</text>
                        <text class="feature-title">关卡闯关</text>
                        <text class="feature-desc">循序渐进的学习体验</text>
                    </view>
                    <view class="feature-item">
                        <text class="feature-icon">📚</text>
                        <text class="feature-title">消防新闻</text>
                        <text class="feature-desc">了解消防新闻，掌握消防动态</text>
                    </view>
                    <view class="feature-item">
                        <text class="feature-icon">🏆</text>
                        <text class="feature-title">ar出口导航</text>
                        <text class="feature-desc">ar出口导航，让你在火灾中快速找到出口</text>
                    </view>
                    <view class="feature-item">
                        <text class="feature-icon">💡</text>
                        <text class="feature-title">实用技巧</text>
                        <text class="feature-desc">贴近生活的安全指南</text>
                    </view>
                </view>
            </view>

            <!-- 联系方式 -->
            <view class="contact-section">
                <text class="section-title">联系我们</text>
                <view class="contact-list">
                    <view class="contact-item">
                        <text class="contact-icon">📧</text>
                        <text class="contact-text">邮箱：2250334995@qq.com</text>
                    </view>
                    <view class="contact-item">
                        <text class="contact-icon">📞</text>
                        <text class="contact-text">电话：18883680618</text>
                    </view>
                </view>
            </view>

            <!-- 版权信息 -->
            <view class="copyright-section">
                <text class="copyright-text">© 2024 消防安全知识. All rights reserved.</text>
            </view>
        </view>
    </layout>
</template>

<script setup lang="ts">
import Layout from '@/layout/index.vue'
</script>

<style scoped>
.about-container {
    min-height: 100vh;
    padding: 20px;
    background: #f5f5f5;
}

.logo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 30px 0;
}

.logo {
    width: 100px;
    height: 100px;
    margin-bottom: 15px;
}

.app-name {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    margin-bottom: 8px;
}

.version {
    font-size: 14px;
    color: #666;
}

.intro-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.intro-text {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    text-align: justify;
}

.features-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 15px;
    display: block;
}

.feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.feature-item {
    background: linear-gradient(120deg, #f6d365 0%, #fda085 100%);
    border-radius: 10px;
    padding: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
}

.feature-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.feature-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
}

.feature-desc {
    font-size: 12px;
    opacity: 0.9;
    text-align: center;
}

.contact-section {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.contact-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.contact-icon {
    font-size: 20px;
}

.contact-text {
    font-size: 14px;
    color: #666;
}

.copyright-section {
    text-align: center;
    padding: 20px 0;
}

.copyright-text {
    font-size: 12px;
    color: #999;
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
    .about-container {
        background: #1f1f1f;
    }
    
    .intro-section,
    .features-section,
    .contact-section {
        background: #2d2d2d;
    }
    
    .app-name {
        color: #fff;
    }
    
    .intro-text,
    .contact-text {
        color: #ccc;
    }
    
    .section-title {
        color: #fff;
    }
    
    .feature-item {
        background: linear-gradient(120deg, #2d2d2d 0%, #3d3d3d 100%);
    }
}
</style>

