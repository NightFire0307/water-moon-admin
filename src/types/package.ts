import type { ApiResponse, Pagination } from './common'

export interface IPackage {
  id: number
  description: string | null
  name: string
  price: string
  items: IPackageItem[]
}

export interface IPackageItem {
  id: number
  name: string
  type: string
  photo_limit: number
  count: number
}

export type PackageResponse = Promise<ApiResponse<{ list: IPackage[] } & Pagination>>
