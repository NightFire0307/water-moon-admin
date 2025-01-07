import type { Pagination, Response } from './common'

export interface IProductType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export type ProductTypeResponse = Promise<Response<{ list: IProductType[] } & Pagination>>
