import axios from 'axios'

// create an axios instance
const service = axios.create({
  timeout: 8000,
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    if (window.location.pathname === '/login') {
      return config
    }

    // 设置请求头部 Authorization
    // if (store.token) {
    //   config.headers.Authorization = `Bearer ${store.token}`
    //   config.headers['Content-Type'] = 'application/json'
    // }
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
    console.error(`err${error}`) // for debug
    return Promise.reject(error)
  },
)

export default service
