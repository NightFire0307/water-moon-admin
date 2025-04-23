import type { Pagination, ApiResponse } from './common'

export interface IProduct {
  id: number
  name: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface IProductType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export type ProductResponse = Promise<ApiResponse<{ list: IProduct[] } & Pagination>>
export type ProductTypeResponse = Promise<ApiResponse<{ list: IProductType[] } & Pagination>>
