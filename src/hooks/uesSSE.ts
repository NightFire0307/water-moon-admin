import { useEffect, useRef } from "react";

interface UseSSEProps<T> {
  url: string;
  options: {
    onMessage: (data: T) => void;
    onError?: (error: any) => void;
  }
}

// `${import.meta.env.VITE_API_BASE_URL}/admin/photos/completions`

export function useSSE<T>({ url, options }: UseSSEProps<T>) {
  const eventSource = useRef<EventSource | null>(null)
  const onMessageRef = useRef(options.onMessage)
  const onErrorRef = useRef(options.onError)

  // 保证回调总是最新
  useEffect(() => {
    onMessageRef.current = options.onMessage
    onErrorRef.current = options.onError
  }, [options.onMessage, options.onError])


  useEffect(() => {
    eventSource.current = new EventSource(url)
    eventSource.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessageRef.current(data)
      } catch (err) {
        onErrorRef.current?.(err)
      }
    }

    eventSource.current.onerror = (error) => {
      onErrorRef.current?.(error)
    }

    return () => {
      eventSource.current?.close()
    }
  }, [url])

  return {
    close: () => eventSource.current?.close()
  }
}