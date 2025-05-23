import type { PermissionResponse } from '@/types/permissions'
import request from '@/utils/request'

export function getPermissions(): PermissionResponse {
  return request({
    url: '/admin/permissions',
    method: 'get',
  })
}
