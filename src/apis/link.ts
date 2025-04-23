import type { PaginationParams, ApiResponse } from '@/types/common.ts'
import type { LinkResponseData, LinksResponseData } from '@/types/link.ts'
import request from '@/utils/request.ts'

interface ShareLinkData {
  order_id: number
  password?: string
  expired_at?: number
}

export function generateShareLink(data: ShareLinkData): LinkResponseData {
  return request({
    url: '/api/admin/order/link',
    method: 'post',
    data,
  })
}

export function getShareLinksByOrderId(orderId: number, params: PaginationParams): LinksResponseData {
  return request({
    url: `/api/admin/order/link/${orderId}`,
    method: 'get',
    params,
  })
}

export function delShareLinkByOrderId(orderId: number): Promise<ApiResponse<number>> {
  return request({
    url: `/api/admin/order/link/${orderId}`,
    method: 'delete',
  })
}
