import type { Pagination, Response } from './common'

export interface IProduct {
  id: number
  name: string
  type: IProductType
  createdAt: string
  updatedAt: string
}

export interface IProductType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export type ProductResponse = Promise<Response<{ list: IProduct[] } & Pagination>>
export type ProductTypeResponse = Promise<Response<{ list: IProductType[] } & Pagination>>
