import type { ApiResponse, Pagination } from '@/types/common'
import { useEffect, useRef, useState } from 'react'

interface InfiniteScrollOptions {
  root?: Element | null // 监听的根元素，默认为 null（即视口）
  threshold?: number // 触发加载更多的阈值
  rootMargin?: string // 根元素的外边距
  pageSize?: number // 每页数据量，默认为 10
}

/**
 * 无限分批加载 hooks
 * @param fetchData 分批加载数据的函数
 * @param options 可选配置项
 * @param options.threshold 触发加载更多的阈值，默认为 1
 * @returns 包含数据、加载状态、是否有更多数据和加载更多函数的
 *
 * @example
 * const { data, hasMore, loadMore, observerRef } = useInfiniteScroll(
 *  (page, pageSize) => getPhotosByOrderId({ orderId, current: page, pageSize }),
 *  {
 *    threshold: 0.5
 *    rootMargin: '0px 0px 100px 0px'
 *  }
 * )
 */
function useInfiniteScroll<T>(
  fetchData: (page: number, pageSize?: number) => Promise<ApiResponse<{ list: T[] } & Pagination>>,
  options?: InfiniteScrollOptions,
) {
  const { threshold = 1, root = null, rootMargin = '0px', pageSize = 10 } = options || {}
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement | null>(null)

  // 获取数据
  const loadData = async () => {
    setLoading(true)

    const { data } = await fetchData(page, pageSize)
    setData(prev => [...prev, ...data.list])

    // 计算是否还有更多数据
    const { current, total } = data
    if ((current + 1) * pageSize >= total) {
      // 处理边界数据情况
      if (current * pageSize >= total) {
        setHasMore(false)
      }
    }

    setLoading(false)
  }

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // 重新加载
  const reload = () => {
    setData([])
    setPage(1)
    setHasMore(true)
  }

  // 设置交叉侦听器
  useEffect(() => {
    if (observerRef.current === null)
      return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore) {
          setPage(prev => prev + 1)
        }
      })
    }, {
      root,
      rootMargin,
      threshold,
    })

    observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [observerRef, hasMore])

  useEffect(() => {
    loadData()
  }, [page])

  return {
    data,
    setPage,
    hasMore,
    loadMore,
    reload,
    observerRef,
  }
}

export default useInfiniteScroll
