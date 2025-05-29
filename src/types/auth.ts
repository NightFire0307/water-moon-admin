import type { ApiResponse } from './common.ts'

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

export interface LoginUserInfo {
  userId: number
  username: string
  nickname: string
  roles: string[]
  permissions: string[]
}

export interface LoginResponse {
  accessToken: string
  userInfo: LoginUserInfo
}

export interface OssTokenResponse {
  uploadToken: string
}

export interface PresignedUrlResponse {
  presignedUrl: string
}

export interface PresignedPolicyResponse {
  postURL: string
  formData: {
    ContentType: string
    bucket: string
    policy: string
    x_amz_algorithm: string
    x_amz_credential: string
    x_amz_date: string
    x_amz_signature: string
  }
}

export type LoginResponseData = Promise<ApiResponse<LoginResponse>>
export type OssTokenResponseData = Promise<ApiResponse<OssTokenResponse>>
export type PresignedUrlResponseData = Promise<ApiResponse<PresignedUrlResponse>>
export type PresignedPolicyResponseData = Promise<ApiResponse<PresignedPolicyResponse>>
