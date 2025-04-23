import type { ApiResponse } from "./common"

interface Role {
  role_id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export type RoleResponse = Promise<ApiResponse<Role[]>>