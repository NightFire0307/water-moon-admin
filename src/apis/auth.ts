import type { OssTokenResponseData } from '@/types/auth.ts'
import request from '@/utils/request.ts'

export function getOssToken(): OssTokenResponseData {
  return request({
    url: '/api/auth/admin/oss-token',
    method: 'GET',
  })
}
