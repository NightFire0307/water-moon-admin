import type { CurrentUserResponseData, LoginResponseData } from '../types/auth.ts'
import request from '../utils/request.ts'

// 登录
export function login(data: { username: string, password: string }): LoginResponseData {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data,
  })
}

// 刷新 Token
export function refreshToken() {
  return request({
    url: '/auth/admin/refresh',
    method: 'post',
  })
}

// 退出登录
export function logout() {
  return request({
    url: '/auth/admin/logout',
    method: 'post',
  })
}

// 获取当前登录用户信息
export function getCurrentUser(): CurrentUserResponseData {
  return request({
    url: '/auth/me',
    method: 'get',
  })
}
