import { useState } from 'react'

/**
 * 自定义 Hook，用于处理搜索输入框的输入事件
 * @param cb 回调函数，当输入框内容变化时调用
 */
export function useSearchInput(cb?: (value: string) => void) {
  const [isComposing, setIsComposing] = useState(false)
  let timer: NodeJS.Timeout

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isComposing)
      return

    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      cb && cb(e.target.value)
    }, 300)
  }

  function onCompositionStart() {
    setIsComposing(true)
  }

  function onCompositionEnd(e: React.CompositionEvent<HTMLInputElement>) {
    setIsComposing(false)
    cb && cb(e.currentTarget.value)
  }

  return {
    onChange,
    onCompositionStart,
    onCompositionEnd,
  }
}
