import type { Response } from '@/types/common.ts'

export interface Link {
  share_url: string
  share_password: string
}

export type LinkResponseData = Promise<Response<Link>>
