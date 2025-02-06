import type { Pagination, Response } from '@/types/common.ts'

export interface IPhoto {
  id: number
  name: string
  oss_url: string
  is_recommend: boolean
  is_selected: boolean
  created_at: string
  updated_at: string
}

export type PhotosResponse = Promise<Response<{ list: IPhoto[] } & Pagination>>
