import type { Pagination, Response } from '@/types/common.ts'

export enum OrderStatus {
  // 未开始、进行中、已提交、已过期
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  SUBMITTED = 2,
  EXPIRED = 3,
}

export interface ProductsInfo {
  id: number
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

export interface IOrder {
  id: number
  order_number: string
  customer_name: string
  customer_phone: string
  selected_photos: number
  max_select_photos: number
  total_photos: number
  extra_photo_price: number
  product_count: number
  access_link: string
  access_password: string
  status: OrderStatus
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type OrderResponse = Promise<Response<{ list: IOrder[] } & Pagination>>
