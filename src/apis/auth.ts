import type { OssTokenResponseData, PresignedPolicyResponseData, PresignedUrlResponseData } from '@/types/auth.ts'
import request from '@/utils/request.ts'

export function getOssToken(): OssTokenResponseData {
  return request({
    url: '/api/auth/admin/oss-token',
    method: 'GET',
  })
}

export function getPresignedUrl(params: { uid: string, name: string, order_number: string }): PresignedUrlResponseData {
  return request({
    url: '/api/auth/admin/oss-token',
    method: 'GET',
    params,
  })
}

export function getPresignedPolicy(params: { order_number: string, file_name: string }): PresignedPolicyResponseData {
  return request({
    url: '/api/auth/admin/oss-token',
    method: 'GET',
    params,
  })
}
