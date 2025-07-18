import { pdf } from '@react-pdf/renderer'
import { message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { PdfDocument } from './PdfDocument'

export function usePdfBlob() {
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

  useEffect(() => {
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
  }
}
