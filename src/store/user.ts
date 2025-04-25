import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types'
import user from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo>({
    id: 0,
    username: '',
    avatar: '',
    email: ''
  })

  // 设置 token
  const setToken = (newToken: string) => {
    token.value = newToken
  }

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    userInfo.value = info
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await user.getUserInfo()
      if (res.code === 100200) {
        setUserInfo(res.data)
      }
      return res
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {
      id: 0,
      username: '',
      avatar: '',
      email: ''
    }
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    getUserInfo,
    logout
  }
}, {
  persist: {
    key: 'user-store',
    paths: ['token', 'userInfo'],
    storage: {
      setItem(key, value) {
        uni.setStorageSync(key, value)
      },
      getItem(key) {
        return uni.getStorageSync(key)
      },
      removeItem(key) {
        uni.removeStorageSync(key)
      }
    }
  }
}) 