import type { Response } from './common.ts'

export interface Permission {
  id: number
  name: string
  module: string
  endpoint: string
  action: string
  description: string
  createTime: string
  updateTime: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  isFrozen: boolean
  isAdmin: boolean
  roles: string[]
  permissions: Permission[]
  createTime: string
  updateTime: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userInfo: UserInfo
}

export interface OssTokenResponse {
  uploadToken: string
}

export interface PresignedUrlResponse {
  presignedUrl: string
}

export type LoginResponseData = Promise<Response<LoginResponse>>
export type OssTokenResponseData = Promise<Response<OssTokenResponse>>
export type PresignedUrlResponseData = Promise<Response<PresignedUrlResponse>>
