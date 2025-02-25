import type { PaginationParams, Response } from '@/types/common.ts'
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

export function resetUserPassword(data: { userId: number, password: string }): Promise<Response<number>> {
  return request({
    url: '/api/admin/users/reset_password',
    method: 'POST',
    data,
  })
}
