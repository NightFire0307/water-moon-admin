import type { ApiErrorResponse } from '@/types/common.ts'
import type { AxiosError } from 'axios'
import { message } from 'antd'
import axios from 'axios'
import localforage from 'localforage'
import { useUserInfo } from '../store/useUserInfo.tsx'

// create an axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 8000,
})

// request interceptor
service.interceptors.request.use(
  async (config) => {
    const tokenFromStore = useUserInfo.getState().accessToken
    const tokenFormLocal = await localforage.getItem('accessToken')

    const accessToken = tokenFromStore || tokenFormLocal

    if (window.location.pathname === '/login') {
      return config
    }

    // 设置请求头部 Authorization
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    console.error(error)
    return Promise.reject(error)
  },
)

// response interceptor
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError<ApiErrorResponse>) => {
    switch (error.status) {
      case 400:
        message.error(error.response?.data.message)
        break
      case 401:
        useUserInfo.getState().clearToken()

        // 如果当前路由不是登录页，则跳转到登录页
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        message.error(error.response?.data.message || '登录已过期，请重新登录')

        return Promise.reject(error)
      case 403:
        return Promise.reject(error.response?.data)
      default:
        message.error('服务器发生错误，请稍后再试')
        break
    }

    return Promise.reject(error)
  },
)

export default service
