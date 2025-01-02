import type { LoginResponseData } from '../types/auth.ts'
import request from '../utils/request.ts'

export function login(data: { username: string, password: string }): LoginResponseData {
  return request({
    url: '/api/auth/admin/login',
    method: 'post',
    data,
  })
}
