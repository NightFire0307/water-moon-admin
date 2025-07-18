import { LeftOutlined, RightOutlined, VerticalLeftOutlined, VerticalRightOutlined } from '@ant-design/icons'
import { Button, Input, Space } from 'antd'
import { useEffect, useState } from 'react'

interface PdfPaginationProps {
  pageNumber: number
  numPages: number
  onNextPageNumber?: (page: number) => void
  onPrevPageNumber?: (page: number) => void
  onFirstPageNumber?: () => void
  onLastPageNumber?: () => void
  onPagerChange?: (page: number) => void
}

export function PdfPagination({
  pageNumber,
  numPages,
  onNextPageNumber,
  onPrevPageNumber,
  onFirstPageNumber,
  onLastPageNumber,
  onPagerChange,
}: PdfPaginationProps) {
  const [inputValue, setInputValue] = useState<string>('')

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value

    // 允许清空（Backspace）
    if (value === '') {
      setInputValue('')
      return
    }

    // 非零开头的整数，例如 1、12、123
    if (/^[1-9]\d*$/.test(value)) {
      setInputValue(value)
    }
  }

  // 处理输入框回车
  function handleInputEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    const page = Number.parseInt(inputValue, 10)

    // TODO: 输入非数字或超出范围时的处理
    if (Number.isNaN(page))
      return

    if (page >= 1 && page <= numPages && page !== pageNumber) {
      onPagerChange?.(page)
    }

    e.currentTarget.blur()
  }

  useEffect(() => {
    setInputValue(`${pageNumber}/${numPages}`)
  }, [pageNumber, numPages])

  return (
    <div>
      <Space size={4}>
        <Button
          type="text"
          icon={<VerticalRightOutlined />}
          size="small"
          onClick={() => onFirstPageNumber?.()}
          disabled={pageNumber === 1}
        />
        <Button
          type="text"
          icon={<LeftOutlined />}
          size="small"
          onClick={() => onPrevPageNumber?.(pageNumber - 1)}
          disabled={pageNumber === 1}
        />
        <Input
          size="small"
          value={inputValue}
          onChange={handleInputChange}
          style={{ width: 80, textAlign: 'center' }}
          onPressEnter={handleInputEnter}
          onFocus={() => setInputValue(pageNumber.toString())}
          onBlur={() => setInputValue(`${pageNumber}/${numPages}`)}
        />
        <Button
          type="text"
          icon={<RightOutlined />}
          size="small"
          onClick={() => onNextPageNumber?.(pageNumber + 1)}
          disabled={pageNumber === numPages}
        />
        <Button
          type="text"
          icon={<VerticalLeftOutlined />}
          size="small"
          onClick={() => onLastPageNumber?.()}
          disabled={pageNumber === numPages}
        />
      </Space>
    </div>
  )
}
