import type { ApiResponse } from '@/types/common.ts'

export interface IPhoto {
  id: number
  uid?: string
  file_name: string
  original_url: string
  thumbnail_url: string
  is_recommend: boolean
}

export type PhotosResponse = Promise<ApiResponse<IPhoto[]>>
