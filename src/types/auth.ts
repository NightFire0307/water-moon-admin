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

export interface Response<T> {
  code: number
  message: string
  data: T
}

export type LoginResponseData = Promise<Response<LoginResponse>>
