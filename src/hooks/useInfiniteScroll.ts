import { useEffect, useRef, useState } from 'react'

/**
 * 无限分批加载 hooks
 */
function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<any>,
) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement | null>(null)

  // 获取数据
  const loadData = async () => {
    setLoading(true)

    const { data } = await fetchData(page)
    setData(prev => [...prev, ...data.list])

    // 计算是否还有更多数据
    const { current, pageSize, total } = data
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
      root: null,
      rootMargin: '0px',
      threshold: 1.0, // 触发阈值
    })

    observer.observe(observerRef.current)

    return () => observer.disconnect()
  }, [observerRef, hasMore])

  useEffect(() => {
    loadData()
  }, [page])

  return {
    data,
    hasMore,
    loadMore,
    observerRef,
  }
}

export default useInfiniteScroll
