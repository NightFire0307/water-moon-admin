import type { CreateOrderData, OrderResponse } from '@/types/order.ts'
import request from '@/utils/request.ts'

export function getOrderList(): OrderResponse {
  return request({
    url: '/api/admin/orders',
    method: 'GET',
  })
}

export function createOrder(data: CreateOrderData) {
  return request({
    url: '/api/admin/orders',
    method: 'POST',
    data,
  })
}
