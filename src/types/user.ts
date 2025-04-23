import type { Pagination, ApiResponse } from '@/types/common.ts'

export interface IUser {
  user_id: number
  username: string
  nickname: string
  phone: string
  roles: { role_id: number, name: string }[]
  isAdmin: boolean
  isFrozen: boolean
  createTime: string
  updateTime: string
}

export type UserResponseData = Promise<ApiResponse<{ list: IUser[] } & Pagination>>
