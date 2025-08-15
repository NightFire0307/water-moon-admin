import type { ApiResponse } from '@/types/common.ts'

export interface IPhoto {
  id: number
  uid?: string
  fileName: string
  originalUrl: string
  thumbnailUrl: string
  isRecommend: boolean
}

export type PhotosResponse = Promise<ApiResponse<IPhoto[]>>
