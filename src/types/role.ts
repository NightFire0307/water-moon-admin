import type { ApiResponse, Pagination } from "./common"

export interface IRole {
  role_id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type RoleResponse = Promise<ApiResponse<{ list: IRole[] } & Pagination>>