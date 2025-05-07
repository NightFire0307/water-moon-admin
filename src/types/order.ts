import type { ApiResponse, Pagination } from '@/types/common.ts'
import type { ILink } from '@/types/link.ts'

export enum OrderStatus {
  // 未开始、进行中、已提交、已过期
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  SUBMITTED = 2,
  CANCEL = 3,
  FINISHED = 4,
}

export interface ProductsInfo {
  id?: number
  name: string
  count: number
}

export interface CreateOrderData {
  order_number: string
  customer_name: string
  customer_phone: string
  order_products: ProductsInfo[]
  max_select_photos: number
  extra_photo_price: number
}

interface OrderProducts {
  id: number
  name: string
  type: string
  photo_limit: number
  is_published: boolean
  count: number
  createdAt: string
  updatedAt: string
}

export interface IOrder {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  selected_photos: number
  max_select_photos: number
  total_photos: number
  extra_photo_price: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

// 订单详情
export interface IOrderDetail {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  select_photos: number
  max_select_photos: number
  order_products: OrderProducts[]
  links: ILink[]
  total_photos: number
  extra_photo_price: number
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface IOrderResultPhoto {
  id: number
  name: string
  remark: string
  status: 'selected' | 'unselected'
  thumbnail: string
  order_products: {
    id: number
    name: string
  }[]
}

// 订单结果
export interface IOrderResult {
  id: number
  photos: IOrderResultPhoto[]
  status: number
  order_number: string
  extra_photo_price: number
  max_select_photos: number
}

export type OrderResponse = Promise<ApiResponse<{ list: IOrder[] } & Pagination>>
export type OrderDetailResponse = Promise<ApiResponse<IOrderDetail>>
export type OrderResultResponse = Promise<ApiResponse<{ list: IOrderResult } & Pagination>>
