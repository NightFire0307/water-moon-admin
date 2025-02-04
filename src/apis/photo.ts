import type { PaginationParams } from '@/types/common.ts'
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
