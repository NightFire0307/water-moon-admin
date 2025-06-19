import type { ApiResponse, Pagination } from './common'

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

export interface IProductDetail {
  id: number
  name: string
  photo_limit: number
  is_published: boolean
  product_type: {
    id: number
    name: string
    createdAt: string
    updatedAt: string
  }
  createdAt: string
  updatedAt: string
}

export interface IProductByCategory {
  id: number
  category: string
  items: {
    productId: number
    name: string
  }[]
}

export type ProductResponse = Promise<ApiResponse<{ list: IProduct[] } & Pagination>>
export type ProductByIdResponse = Promise<ApiResponse<IProductDetail>>
export type ProductTypeResponse = Promise<ApiResponse<{ list: IProductType[] } & Pagination>>
export type ProductByCategoryResponse = Promise<ApiResponse<IProductByCategory[]>>
