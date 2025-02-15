import type { Response } from '@/types/common.ts'

export interface IPhoto {
  id: number
  file_name: string
  original_url: string
  thumbnail_url: string
  is_recommend: boolean
}

export type PhotosResponse = Promise<Response<IPhoto[]>>
