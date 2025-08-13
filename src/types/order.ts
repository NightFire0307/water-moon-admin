import type { ApiResponse, Pagination } from '@/types/common.ts'
import type { ILink } from '@/types/link.ts'

export enum OrderStatus {
  PENDING = 'pending', // 订单已创建，等待用户选片
  PRE_SELECT = 'pre_select', // 预选阶段
  PRODUCT_SELECT = 'product_select', // 产品选片阶段
  SUBMITTED = 'submitted', // 已提交，订单锁定
  CANCEL = 'cancel', // 订单取消
  FINISHED = 'finished', // 订单完成
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
  photoLimit: number
  isPublished: boolean
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
  orderNumber: string
  customerName: string
  customerPhone: string
  selectPhotos: number
  maxSelectPhotos: number
  orderProducts: OrderProducts[]
  links: ILink[]
  totalPhotos: number
  extraPhotoPrice: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
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
  fileName: string
  thumbnailUrl: string
  remark: string
  orderProduct: { id: number, name: string }[]
}

// 订单统计
export interface IOrderSummary {
  totalOrderCount: number
  inProgressOrderCount: number
  completedOrderCount: number
  todayOrderCount: number
}

export type OrderResponse = Promise<ApiResponse<{ list: IOrder[] } & Pagination>>
export type OrderDetailResponse = Promise<ApiResponse<IOrderDetail>>
export type OrderResultResponse = Promise<ApiResponse<{ list: IOrderResult } & Pagination>>
export type OrderSummaryResponse = Promise<ApiResponse<IOrderSummary>>
