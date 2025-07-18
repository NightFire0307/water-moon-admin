import { CloseOutlined, DownloadOutlined, LoadingOutlined, MinusOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons'
import { Button, Divider, Modal, Space, Spin } from 'antd'
import { type FC, useEffect, useMemo, useState } from 'react'
import { Document, Page, type PageProps, pdfjs } from 'react-pdf'
import { PdfPagination } from './PdfPagination'
import styles from './PdfViewer.module.less'
import { usePdfBlob } from './usePdfBlob'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface ExportPdfProps {
  open: boolean
  onClose?: () => void
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface ModalTitleProps {
  onDownload?: () => void
  onPrint?: () => void
  onClose?: () => void
}

function ModalTitle({ onPrint, onDownload, onClose }: ModalTitleProps) {
  return (
    <div className={styles.pdfViewerModalTitle}>
      <span>D9999 产品制作单.pdf</span>
      <Space>
        <Button icon={<DownloadOutlined />} type="text" onClick={() => onDownload && onDownload()}>下载</Button>
        <Button icon={<PrinterOutlined />} type="text" onClick={() => onPrint && onPrint()}>打印</Button>
        <Divider type="vertical" style={{ borderInlineStart: '1px solid rgba(23, 45, 69, 20%)' }} />
        <Button type="text" icon={<CloseOutlined />} onClick={() => onClose && onClose()} />
      </Space>
    </div>
  )
}

function PdfLoading() {
  return (
    <div className={styles.pdfViewerLoading}>
      <Spin indicator={<LoadingOutlined spin />} size="large" />
      <p className={styles.pdfViewerLoading__text}>正在生成PDF请稍等...</p>
    </div>
  )
}

export const PDFViewer: FC<ExportPdfProps> = ({ open, onClose }) => {
  const {
    pdfBlobUrl,
    printPdf,
    onDocumentLoadSuccess,
    pageNumber,
    setPageNumber,
    numPages,
    generatePdfBlob,
    downloadBlobAsPdf,
  } = usePdfBlob({ options: { manual: true } })
  const [pageProps, setPageProps] = useState<PageProps>({
    scale: 1,
    canvasBackground: '#f3f5f7',
    loading: null,
  })

  // 放大缩小处理
  function handleZoom(delta: number) {
    setPageProps((prev) => {
      // 确保缩放比例在合理范围内
      const newScale = Math.max(0.1, Math.min(5, (prev.scale ?? 1) + delta)).toFixed(2)
      return {
        ...prev,
        scale: Number.parseFloat(newScale),
      }
    })
  }

  const scaleLevel = useMemo(() => {
    return ((pageProps.scale ?? 1) * 100).toFixed(0)
  }, [pageProps.scale])

  useEffect(() => {
    if (open) {
      generatePdfBlob()
    }
  }, [open])

  return (
    <Modal
      open={open}
      title={(
        <ModalTitle
          onPrint={printPdf}
          onDownload={downloadBlobAsPdf}
          onClose={onClose}
        />
      )}
      classNames={{
        content: styles.pdfViewerModalContent,
        body: styles.pdfViewerModalBody,
      }}
      styles={{
        header: {
          marginBottom: 0,
        },
        content: {
          padding: 0,
        },
      }}
      centered
      closable={false}
      width="100%"
      footer={null}
      destroyOnClose
    >

      <div className={styles.pdfViewerPager}>
        <Document
          file={pdfBlobUrl}
          loading={<PdfLoading />}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page {...pageProps} pageNumber={pageNumber} />
        </Document>
      </div>

      <div className={styles.pdfViewerModalFooter}>
        <div className={styles.pdfViewerModalFooter__left}>
          <PdfPagination
            pageNumber={pageNumber}
            numPages={numPages}
            onFirstPageNumber={() => setPageNumber(1)}
            onPrevPageNumber={page => setPageNumber(Math.max(1, page))}
            onLastPageNumber={() => setPageNumber(numPages)}
            onNextPageNumber={page => setPageNumber(Math.min(numPages, page))}
            onPagerChange={page => setPageNumber(Math.max(1, Math.min(numPages, page)))}
          />
        </div>

        <div className={styles.pdfViewerModalFooter__right}>
          <Button size="small" icon={<MinusOutlined />} type="text" onClick={() => handleZoom(-0.05)} />
          <div className={styles.pdfViewerModalFooter__zoomLevel}>
            <span>
              {scaleLevel}
              %
            </span>
          </div>
          <Button size="small" icon={<PlusOutlined />} type="text" onClick={() => handleZoom(0.05)} />
        </div>
      </div>
    </Modal>
  )
}
