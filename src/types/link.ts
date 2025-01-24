import type { Response } from '@/types/common.ts'

export interface Link {
  id: number
  share_url: string
  share_password: string
  status: string
  expired_at: string
  created_at: string
  created_by: number
}

export type LinkResponseData = Promise<Response<Link>>
