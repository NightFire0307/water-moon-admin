import { message } from 'antd'
import axios from 'axios'
import localforage from 'localforage'
import { useUserInfo } from '../store/useUserInfo.tsx'

// create an axios instance
const service = axios.create({
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
      config.headers['Content-Type'] = 'application/json'
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
  (error) => {
    message.error(`接口请求错误：${error.code}`)
    return Promise.reject(error)
  },
)

export default service
