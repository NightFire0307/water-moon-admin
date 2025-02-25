import request from '@/utils/request.ts'

export function getRoleList(params) {
  return request({
    url: '/api/admin/roles',
    method: 'GET',
    params,
  })
}
