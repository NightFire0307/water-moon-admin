import type { Pagination, Response } from '@/types/common.ts'

export interface IUser {
  user_id: number
  username: string
  nickname: string
  phone: string
  roles: []
  isAdmin: boolean
  isFrozen: boolean
  createTime: string
  updateTime: string
}

export type UserResponseData = Promise<Response<{ list: IUser[] } & Pagination>>
