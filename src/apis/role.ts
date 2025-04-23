import type { RoleResponse } from '@/types/role'
import request from '@/utils/request.ts'

export function getRoleList(params = {}): RoleResponse {
  return request({
    url: '/api/admin/roles',
    method: 'GET',
    params,
  })
}
