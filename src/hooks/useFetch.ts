import { useEffect, useRef, useState } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: (...args: any[]) => Promise<any> // 重新获取数据的函数
}

interface UseFetchOptions<TData, TParams> {
  // 手动请求
  manual?: boolean
  // 请求参数
  params?: TParams[]
  // 请求成功回调函数
  onSuccess?: (result: TData, params: TParams[]) => void
}

export function useFetch<TData, TParams>(
  fetchFn: (...args: TParams[]) => Promise<{ data: TData }>,
  options: UseFetchOptions<TData, TParams>,
): UseFetchResult<TData> {
  const { manual, params = [], onSuccess } = options
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latestRequestId = useRef(0)

  const refetch = async (...args: any[]) => {
    const requestId = latestRequestId.current + 1
    latestRequestId.current = requestId
    setLoading(true)
    setError(null)
    try {
      const { data } = await fetchFn(...params, ...args)
      if (requestId === latestRequestId.current) {
        setData(data)
        onSuccess && onSuccess(data, params || [])
      }
    }
    catch (err) {
      setError('获取数据失败')
      console.error(err)
    }
    finally {
      if (requestId === latestRequestId.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!manual) {
      refetch()
    }
  }, [manual, params])

  return {
    data,
    loading,
    error,
    refetch,
  }
}
