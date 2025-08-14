import type { ApiResponse } from '@/types/common.ts'
import type { CreateOrderData, IOrder, OrderDetailResponse, OrderResponse, OrderResultResponse, OrderSummaryResponse } from '@/types/order.ts'
import request from '@/utils/request.ts'

export function getOrderList(params = {}): OrderResponse {
  return request({
    url: '/admin/orders',
    method: 'GET',
    params,
  })
}

export function getOrderDetailById(id: number): OrderDetailResponse {
  return request({
    url: `/admin/orders/${id}`,
    method: 'GET',
  })
}

export function createOrder(data: CreateOrderData): Promise<ApiResponse<IOrder>> {
  return request({
    url: '/admin/orders',
    method: 'POST',
    data,
  })
}

export function updateOrder(id: number, data: { id: number & CreateOrderData }): Promise<ApiResponse<number>> {
  return request({
    url: `/admin/orders/${id}`,
    method: 'PUT',
    data,
  })
}

export function removeOrder(id: number): Promise<ApiResponse<string>> {
  return request({
    url: `/admin/orders/${id}`,
    method: 'DELETE',
  })
}

export function resetOrderStatus(id: number, data: { reset: boolean }): Promise<ApiResponse<number>> {
  return request({
    url: `/admin/orders/${id}?reset=${data.reset}`,
    method: 'post',
  })
}

export function getOrderResult(id: number): OrderResultResponse {
  return request({
    url: `/admin/orders/${id}/result`,
    method: 'GET',
  })
}

export function downloadResult(id: number): Promise<Blob> {
  return request({
    url: `/admin/orders/${id}/result/export`,
    method: 'GET',
    responseType: 'blob',
  })
}

export function getOrderSummary(): OrderSummaryResponse {
  return request({
    url: '/admin/orders/summary',
    method: 'GET',
  })
}

export function getWeeklyOrderStats() {
  return request({
    url: '/admin/orders/weekly-stats',
    method: 'GET',
  })
}

// 获取订单下所有的照片ID
export function getOrderPhotoIds(orderId: number) {
  return request({
    url: `/admin/orders/${orderId}/photo-ids`,
    method: 'GET',
  })
}
