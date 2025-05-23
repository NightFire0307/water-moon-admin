import type { ApiResponse } from './common'

export interface IPermission {
  id: number
  name: string
  description: string
  code: string
  type: 'group' | 'button'
  parentId: number | null
  action: string | null
  children?: IPermission[]
  createTime: string
  updateTime: string
}

export type PermissionResponse = Promise<ApiResponse<IPermission[]>>
