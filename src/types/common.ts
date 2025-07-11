export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface ApiErrorResponse {
  code: number
  message: string
  data?: any
}

export interface Pagination {
  current: number
  pageSize: number
  total: number
}

export type PaginationParams = Partial<Omit<Pagination, 'total'>>
