import type { ApiResponse } from '@/types/common.ts'
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

export function createOrder(data: CreateOrderData): Promise<ApiResponse<IOrder>> {
  return request({
    url: '/api/admin/orders',
    method: 'POST',
    data,
  })
}

export function updateOrder(id: number, data: { id: number & CreateOrderData }): Promise<ApiResponse<number>> {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'PUT',
    data,
  })
}

export function removeOrder(id: number): Promise<ApiResponse<string>> {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'DELETE',
  })
}

export function resetOrderStatus(id: number, data: { status: number }): Promise<ApiResponse<number>> {
  return request({
    url: `/api/admin/orders/${id}`,
    method: 'patch',
    data,
  })
}
