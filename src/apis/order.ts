import type { Response } from '@/types/common.ts'
import type { CreateOrderData, IOrder, OrderResponse } from '@/types/order.ts'
import request from '@/utils/request.ts'

export function getOrderList(params = {}): OrderResponse {
  return request({
    url: '/api/admin/orders',
    method: 'GET',
    params,
  })
}

export function createOrder(data: CreateOrderData): Promise<Response<IOrder>> {
  return request({
    url: '/api/admin/orders',
    method: 'POST',
    data,
  })
}

export function removeOrder(id: number): Promise<Response<string>> {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'DELETE',
  })
}
