import type { ApiResponse, Pagination } from '@/types/common.ts'

export interface IPhoto {
  id: number
  uid?: string
  fileName: string
  originalUrl: string
  thumbnailUrl: string
  isRecommend: boolean
}

export interface GetPhotoListResult {
  uuid: number
  name: string
  ossKey: string
  ossUrlThumbnail: string
  ossUrlMedium: string
  expiresAt: number
  remark?: string
}

export type PhotosResponse = Promise<ApiResponse<IPhoto[]>>
export type GetPhotoListRes = Promise<ApiResponse<{ list: GetPhotoListResult[] } & Pagination>>
