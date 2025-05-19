import type { ApiResponse, Pagination } from '@/types/common.ts'

export interface ILink {
  id: number
  share_url: string
  share_password: string
  status: string
  expired_at: number
  created_at: string
  created_by: number
}

export type LinkResponseData = Promise<ApiResponse<ILink>>
export type LinksResponseData = Promise<ApiResponse<{ list: ILink[] } & Pagination>>
