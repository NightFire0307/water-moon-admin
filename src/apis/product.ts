import type { Response } from '../types/common.ts'
import request from '../utils/request.ts'

export function getProductList() {
  return request({
    url: '/api/admin/product',
    method: 'get',
  })
}

export function getProductTypes() {
  return request({
    url: '/api/admin/product/type',
    method: 'get',
  })
}

export function createProductType(data: { name: string }): Promise<Response<string>> {
  return request({
    url: '/api/admin/product/type',
    method: 'post',
    data,
  })
}
