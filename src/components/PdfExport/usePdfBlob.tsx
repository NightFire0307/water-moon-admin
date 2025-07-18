import { pdf } from '@react-pdf/renderer'
import { message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { PdfDocument } from './PdfDocument'

interface usePdfBlobProps {
  options?: {
    manual?: boolean
  }
}

export function usePdfBlob({ options = {} }: usePdfBlobProps = {}) {
  const { manual = false } = options

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const currentBlobUrl = useRef<string | null>(null)

  // 处理打印 PDF 功能
  function printPdf() {
    if (currentBlobUrl.current) {
      const printWindow = window.open(currentBlobUrl.current, '_blank')

      printWindow?.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setPageNumber(1)
  }

  // 生成 PDF Blob
  const generatePdfBlob = async () => {
    try {
      setLoading(true)

      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current)
        currentBlobUrl.current = null
      }

      const blob = await pdf(<PdfDocument />).toBlob()
      const url = URL.createObjectURL(blob)
      setPdfBlobUrl(url)
      currentBlobUrl.current = url
    }
    catch (err) {
      message.error('PDF生成失败，请稍后重试')
      console.error('PDF generation error:', err)
    }
    finally {
      setLoading(false)
    }
  }

  /**
   * 下载 PDF Blob
   * @param fileName 文件名，默认为 '产品制作单'
   * @returns {void}
   */
  const downloadBlobAsPdf = (fileName?: string) => {
    if (!currentBlobUrl.current)
      return

    const a = document.createElement('a')
    a.href = currentBlobUrl.current
    a.download = `${fileName ?? '产品制作单'}.pdf`
    a.click()
  }

  useEffect(() => {
    if (manual)
      return

    generatePdfBlob()
  }, [])

  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current)
        currentBlobUrl.current = null
      }
    }
  }, [])

  return {
    pdfBlobUrl,
    loading,
    setLoading,
    printPdf,
    pageNumber,
    setPageNumber,
    numPages,
    onDocumentLoadSuccess,
    generatePdfBlob,
    downloadBlobAsPdf,
  }
}
