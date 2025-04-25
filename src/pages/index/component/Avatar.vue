<template>
	<view class="avatar-wrapper">
		<view class="avatar-container" @click="handleClick">
			<image 
				:src="src || defaultAvatar" 
				:style="{ width: size + 'px', height: size + 'px' }"
				class="avatar-image"
				mode="aspectFill"
			/>
			<view class="avatar-mask">
				<view class="upload-icon">
					<text class="icon-text">📷</text>
					<text class="upload-text">点击上传</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	src: {
		type: String,
		default: ''
	},
	size: {
		type: Number,
		default: 100
	}
})

const defaultAvatar = '/static/default-avatar.png'

const handleClick = () => {
	uni.$emit('avatar-click')
}
</script>

<style scoped>
.avatar-wrapper {
	display: flex;
	justify-content: center;
	margin: 20px 0;
}

.avatar-container {
	position: relative;
	border-radius: 50%;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	border: 4px solid #fff;
	transition: all 0.3s ease;
}

.avatar-container:hover .avatar-mask {
	opacity: 1;
}

.avatar-image {
	display: block;
	border-radius: 50%;
	background-color: #f5f5f5;
}

.avatar-mask {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	opacity: 0;
	transition: opacity 0.3s ease;
	border-radius: 50%;
}

.upload-icon {
	text-align: center;
	color: #fff;
}

.icon-text {
	font-size: 24px;
	display: block;
	margin-bottom: 4px;
}

.upload-text {
	font-size: 12px;
	opacity: 0.9;
}

/* 添加动画效果 */
.avatar-container:active {
	transform: scale(0.95);
}

@keyframes pulse {
	0% {
		box-shadow: 0 4px 12px rgba(253, 160, 133, 0.2);
	}
	50% {
		box-shadow: 0 4px 20px rgba(253, 160, 133, 0.4);
	}
	100% {
		box-shadow: 0 4px 12px rgba(253, 160, 133, 0.2);
	}
}

.avatar-container:hover {
	animation: pulse 1.5s infinite;
}
</style>