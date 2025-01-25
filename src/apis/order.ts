import type { Response } from '@/types/common.ts'
import type { CreateOrderData, IOrder, OrderDetailResponse, OrderResponse } from '@/types/order.ts'
import request from '@/utils/request.ts'

export function getOrderList(params = {}): OrderResponse {
  return request({
    url: '/api/admin/orders',
    method: 'GET',
    params,
  })
}

export function getOrderDetailById(id: number): OrderDetailResponse {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'GET',
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
