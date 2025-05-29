import type { ApiResponse, Pagination } from './common'

export interface IRole {
  roleId: number
  name: string
  description: string
  created_at: string
  updated_at: string
  permissionIds: number[]
}

export interface IRoleData {
  name: string
  description: string
  permissionIds: number[]
}

export type RoleResponse = Promise<ApiResponse<{ list: IRole[] } & Pagination>>
