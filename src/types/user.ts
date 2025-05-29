import type { ApiResponse, Pagination } from '@/types/common.ts'

export interface IUser {
  user_id: number
  username: string
  nickname: string
  phone: string
  roles: { roleId: number, name: string }[]
  isAdmin: boolean
  isFrozen: boolean
  createTime: string
  updateTime: string
}

export type UserResponseData = Promise<ApiResponse<{ list: IUser[] } & Pagination>>
