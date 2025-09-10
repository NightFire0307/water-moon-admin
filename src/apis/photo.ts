import type { ApiResponse, PaginationParams } from '@/types/common.ts'
import type { GetPhotoListRes, PhotosResponse } from '@/types/photo.ts'
import request from '@/utils/request'

interface GetPhotosByOrderIdParams extends PaginationParams {
  orderId: number
}

export function getPhotosByOrderId(params: GetPhotosByOrderIdParams): GetPhotoListRes {
  return request({
    url: `/admin/photos`,
    method: 'get',
    params,
  })
}

export function updatePhotosRecommend(orderId: number, data: { photoIds: number[], isRecommended: boolean }): Promise<ApiResponse<number[]>> {
  return request({
    url: `/admin/photos/recommend/${orderId}`,
    method: 'put',
    data,
  })
}

export function savePhotos(orderId: number, data: { file_name: string, file_size: number }[]): PhotosResponse {
  return request({
    url: `/admin/photos/${orderId}`,
    method: 'post',
    data,
  })
}

export function removePhotos(orderId: number, data: { photoIds: number[] }) {
  return request({
    url: `/admin/photos/${orderId}`,
    method: 'delete',
    data,
  })
}

export function removeAllPhotos(orderId: number): Promise<ApiResponse<null>> {
  return request({
    url: `/admin/photos/all/${orderId}`,
    method: 'delete',
  })
}

// 通知服务端照片上传完成
export function notifyUploadComplete(orderId: number) {
  return request({
    url: `/admin/photos/upload/commit/${orderId}`,
    method: 'post',
  })
}
