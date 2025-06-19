import request from '@/utils/request.ts'

export function getPackageList() {
  return request({
    url: '/admin/packages',
    method: 'get',
  })
}

export function createPackage(data: any) {
  return request({
    url: '/admin/packages',
    method: 'post',
    data,
  })
}

export function updatePackage(id: number, data: any) {
  return request({
    url: `/admin/packages/${id}`,
    method: 'put',
    data,
  })
}

export function deletePackage(id: number) {
  return request({
    url: `/admin/packages/${id}`,
    method: 'delete',
  })
}
