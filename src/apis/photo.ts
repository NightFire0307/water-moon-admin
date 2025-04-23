import type { PaginationParams, ApiResponse } from '@/types/common.ts'
import type { PhotosResponse } from '@/types/photo.ts'
import request from '@/utils/request'

interface GetPhotosByOrderIdParams extends PaginationParams {
  orderId: number
}

export function getPhotosByOrderId(params: GetPhotosByOrderIdParams) {
  return request({
    url: `/api/admin/photos`,
    method: 'get',
    params,
  })
}

export function updatePhotosRecommend(orderId: number, data: { photoIds: number[], isRecommended: boolean }): Promise<ApiResponse<number[]>> {
  return request({
    url: `/api/admin/photos/recommend/${orderId}`,
    method: 'put',
    data,
  })
}

export function savePhotos(orderId: number, data: { file_name: string, file_size: number }[]): PhotosResponse {
  return request({
    url: `/api/admin/photos/${orderId}`,
    method: 'post',
    data,
  })
}

export function removePhotos(orderId: number, data: { photoIds: number[] }) {
  return request({
    url: `/api/admin/photos/${orderId}`,
    method: 'delete',
    data,
  })
}
