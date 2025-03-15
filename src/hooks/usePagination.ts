import type { TablePaginationConfig } from 'antd/es/table'
import { useState } from 'react'

interface UsePaginationOptions {
  defaultPageSize?: number
  defaultCurrent?: number
}

interface UsePaginationResult {
  pagination: TablePaginationConfig
  setTotal: (total: number) => void
  reset: () => void
  current: number
  pageSize: number
}

/**
 * 分页逻辑的自定义Hook
 * @param options 分页配置选项
 * @returns 分页相关状态和方法
 */
export default function usePagination(options?: UsePaginationOptions): UsePaginationResult {
  const { defaultPageSize = 10, defaultCurrent = 1 } = options || {}

  const [current, setCurrent] = useState(defaultCurrent)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [total, setTotal] = useState(0)

  const pagination: TablePaginationConfig = {
    current,
    pageSize,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: total => `共 ${total} 条记录`,
    onChange: (page, pageSize) => {
      setCurrent(page)
      setPageSize(pageSize)
    },
    onShowSizeChange: (_, size) => {
      setCurrent(1) // 切换每页条数时重置为第一页
      setPageSize(size)
    },
  }

  // 重置分页状态
  const reset = () => {
    setCurrent(defaultCurrent)
    setPageSize(defaultPageSize)
  }

  return {
    pagination,
    setTotal,
    reset,
    current,
    pageSize,
  }
}
