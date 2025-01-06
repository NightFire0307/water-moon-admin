import type { Response } from '../types/common.ts'
import type { ProductTypeResponse } from '../types/product.ts'
import request from '../utils/request.ts'

export function getProductList(): ProductTypeResponse {
  return request({
    url: '/api/admin/product',
    method: 'GET',
  })
}

export function queryProductByName(name: string): ProductTypeResponse {
  return request({
    url: `/api/admin/product/type?name=${name}`,
    method: 'GET',
  })
}

export function getProductTypes() {
  return request({
    url: '/api/admin/product/type',
    method: 'GET',
  })
}

export function createProductType(data: { name: string }): Promise<Response<string>> {
  return request({
    url: '/api/admin/product/type',
    method: 'POST',
    data,
  })
}

export function deleteProductType(id: number): Promise<Response<string>> {
  return request({
    url: `/api/admin/product/type/${id}`,
    method: 'DELETE',
  })
}
