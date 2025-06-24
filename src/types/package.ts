import type { ApiResponse } from './common'

export interface IPackage {
  id: number
  name: string
  price: string
  is_published: boolean
  items: IPackageItem[]
}

export interface IPackageItem {
  id: number
  count: number
  product: {
    id: number
    name: string
    is_published: boolean
    photo_limit: number
    createdAt: string
    updatedAt: string
  }
  product_type: string
}

export type PackageResponse = Promise<ApiResponse<IPackage[]>>
