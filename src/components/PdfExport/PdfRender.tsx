import { CloseOutlined, DownloadOutlined, LoadingOutlined, MinusOutlined, PlusOutlined, PrinterOutlined } from '@ant-design/icons'
import { PDFViewer } from '@react-pdf/renderer'
import { Button, Divider, Modal, Space, Spin } from 'antd'
import dayjs from 'dayjs'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page, type PageProps, pdfjs } from 'react-pdf'
import { getOrderPdfData } from '@/apis/order.ts'
import { PdfDocument } from '@/components/PdfExport/PdfDocument.tsx'
import { useOrderStore } from '@/store/useOrderStore.ts'
import { PdfPagination } from './PdfPagination.tsx'
import styles from './PdfViewer.module.less'
import { usePdfBlob } from './usePdfBlob.ts'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

interface ExportPdfProps {
  open: boolean
  onClose?: () => void
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString()

interface ModalTitleProps {
  onDownload?: () => void
  onPrint?: () => void
  onClose?: () => void
}

// 模态框标题
function ModalTitle({ onPrint, onDownload, onClose }: ModalTitleProps) {
  const { orderInfo } = useOrderStore()

  return (
    <div className={styles.pdfViewerModalTitle}>
      <span>
        { orderInfo?.orderNumber }
        {' - '}
        产品制作单
      </span>
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

export const PdfRender: FC<ExportPdfProps> = ({ open, onClose }) => {
  const [pageProps, setPageProps] = useState<PageProps>({
    scale: 1,
    canvasBackground: '#f3f5f7',
    loading: null,
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { orderInfo } = useOrderStore()
  const [pdfData, setPdfData] = useState()

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

    // 缩放后重置滚动位置
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }

  // 计算缩放百分比
  const scaleLevel = useMemo(() => {
    return ((pageProps.scale ?? 1) * 100).toFixed(0)
  }, [pageProps.scale])

  // 获取订单PDF数据
  const fetchDocumentData = async () => {
    if (orderInfo == null)
      return
    const { data } = await getOrderPdfData(orderInfo.id)
    console.log(data)
    setPdfData({
      ...data,
      selectDate: dayjs(data.selectDate).format('YYYY-MM-DD'),
    })
  }

  useEffect(() => {
    if (open) {
      fetchDocumentData()
    }
  }, [open])

  return (
    <Modal
      open={open}
      title="产品制作单"
      classNames={{
        content: styles.pdfViewerModalContent,
        body: styles.pdfViewerModalBody,
      }}
      centered
      width="100%"
      footer={null}
      onCancel={onClose}
      destroyOnHidden
    >

      <div className={styles.pdfViewerPager} ref={scrollContainerRef}>
        <PDFViewer style={{ height: '100%', width: '100%' }}>
          <PdfDocument data={pdfData} />
        </PDFViewer>
      </div>

    </Modal>
  )
}
