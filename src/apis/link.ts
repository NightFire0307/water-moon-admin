import type { LinkResponseData } from '@/types/link.ts'
import request from '@/utils/request.ts'

interface ShareLinkData {
  order_id: number
  password?: string
  expired_at: number
}

export function getRandomShareLink(data: ShareLinkData): LinkResponseData {
  return request({
    url: '/api/admin/order/link',
    method: 'post',
    data,
  })
}
