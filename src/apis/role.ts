import type { IRoleData, RoleResponse } from '@/types/role'
import request from '@/utils/request.ts'

export function getRoleList(params = {}): RoleResponse {
  return request({
    url: '/admin/roles',
    method: 'GET',
    params,
  })
}

export function createRole(data) {
  return request({
    url: '/admin/roles',
    method: 'POST',
    data,
  })
}

export function updateRole(roleId: number, data: IRoleData) {
  return request({
    url: `/admin/roles/${roleId}`,
    method: 'PUT',
    data,
  })
}

export function deleteRole(roleId: number) {
  return request({
    url: `/admin/roles/${roleId}`,
    method: 'DELETE',
  })
}

export function getRoleByRoleId(roleId: number) {
  return request({
    url: `/admin/roles/${roleId}`,
    method: 'GET',
  })
}

export function updateRolePermissions(roleId: number, permissions: number[]) {
  return request({
    url: `/admin/roles/${roleId}/permissions`,
    method: 'PUT',
    data: {
      permissions,
    },
  })
}
