import type { ApiResponse, PaginationParams } from '@/types/common'
import type { PackageResponse } from '@/types/package'
import request from '@/utils/request.ts'

interface PackageParams {
  name?: string
  isPublished?: boolean
}

export function getPackageList(params?: PaginationParams & PackageParams): PackageResponse {
  return request({
    url: '/admin/packages',
    method: 'get',
    params,
  })
}

export function getPackageById(id: number) {
  return request({
    url: `/admin/packages/${id}`,
    method: 'get',
  })
}

export function createPackage(data: any): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/packages',
    method: 'post',
    data,
  })
}

export function updatePackage(id: number, data: any): PackageResponse {
  return request({
    url: `/admin/packages/${id}`,
    method: 'put',
    data,
  })
}

export function deletePackage(id: number): Promise<ApiResponse<number>> {
  return request({
    url: `/admin/packages/${id}`,
    method: 'delete',
  })
}
