import type { ApiResponse, PaginationParams } from '@/types/common.ts'
import type { UserResponseData } from '@/types/user.ts'
import request from '@/utils/request'

type UserParams = PaginationParams & { username?: string }

export function getUserList(params: UserParams): UserResponseData {
  return request({
    url: '/api/admin/users',
    method: 'GET',
    params,
  })
}

export function createUser(data: any) {
  return request({
    url: '/api/admin/users',
    method: 'POST',
    data,
  })
}

export function updateUser(userId: number, data: any) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'PUT',
    data,
  })
}

export function resetUserPassword(data: { userId: number, password: string }): Promise<ApiResponse<number>> {
  return request({
    url: '/api/admin/users/reset_password',
    method: 'POST',
    data,
  })
}

export function delUserById(userId: number): Promise<ApiResponse<number>> {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'DELETE',
  })
}
