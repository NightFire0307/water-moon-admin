export interface Response<T> {
  code: number
  msg: string
  data: T
}

export interface Pagination {
  current: number
  pageSize: number
  total: number
}
