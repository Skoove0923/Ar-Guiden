import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
  transformRequest: [
    function(data, headers) {
      // 如果是 FormData 则直接返回
      if (data instanceof FormData) {
        return data
      }
      // 否则按照默认方式处理
      return JSON.stringify(data)
    }
  ]
})

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = uni.getStorageSync('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    return Promise.reject(error)
  }
)

export default request 