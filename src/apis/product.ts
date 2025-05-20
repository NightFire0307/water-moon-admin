import type { ApiResponse, PaginationParams } from '../types/common.ts'
import type { IProduct, ProductByIdResponse, ProductResponse, ProductTypeResponse } from '../types/product.ts'
import request from '../utils/request.ts'

export interface ProductQueryParams extends PaginationParams {
  name?: string
  productType?: number
}

export function getProductList(params: ProductQueryParams): ProductResponse {
  return request({
    url: '/admin/product',
    method: 'GET',
    params,
  })
}

export interface ProductCreateParams {
  name: string
  productType: number
}

export function createProduct(data: ProductCreateParams): Promise<ApiResponse<IProduct>> {
  return request({
    url: '/admin/product',
    method: 'POST',
    data,
  })
}

export function getProductById(id: number): ProductByIdResponse {
  return request({
    url: `/admin/product/${id}`,
    method: 'GET',
  })
}

export function updateProduct(id: number, data: ProductCreateParams): Promise<ApiResponse<IProduct>> {
  return request({
    url: `/admin/product/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteProduct(id: number): Promise<ApiResponse<string>> {
  return request({
    url: `/admin/product/${id}`,
    method: 'DELETE',
  })
}

export function queryProductByName(name: string): ProductTypeResponse {
  return request({
    url: `/admin/product/type?name=${name}`,
    method: 'GET',
  })
}

export function getProductTypes(params: PaginationParams): ProductTypeResponse {
  return request({
    url: '/admin/product/type',
    method: 'GET',
    params,
  })
}

// 获取产品类型详情
export function getProductTypeById(id: number) {
  return request({
    url: `/admin/product/type/${id}`,
    method: 'GET',
  })
}

export function createProductType(data: { name: string }): Promise<ApiResponse<string>> {
  return request({
    url: '/admin/product/type',
    method: 'POST',
    data,
  })
}

export function updateProductType(id: number, data: { name: string }): Promise<ApiResponse<string>> {
  return request({
    url: `/admin/product/type/${id}`,
    method: 'PUT',
    data,
  })
}

export function deleteProductType(id: number): Promise<ApiResponse<string>> {
  return request({
    url: `/admin/product/type/${id}`,
    method: 'DELETE',
  })
}

export function batchDeleteProductType(data: { ids: number[] }): Promise<ApiResponse<string>> {
  return request({
    url: '/admin/product/type',
    method: 'DELETE',
    data,
  })
}
