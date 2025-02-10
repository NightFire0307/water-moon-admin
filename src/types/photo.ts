import type { Response } from '@/types/common.ts'

export interface IPhoto {
  id: number
  name: string
  oss_url: string
  is_recommend: boolean
  size: number
}

export type PhotosResponse = Promise<Response<IPhoto[]>>
