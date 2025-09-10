import { getOrderDetailById } from '@/apis/order.ts'
import { ImageGallery } from '@/components/ImageGallery/ImageGallery.tsx'
import { useOrderInfoContext } from '@/contexts/OrderInfoContext'
import { useMinioUpload } from '@/store/useMinioUpload.ts'
import { Drawer } from 'antd'
import { useEffect, useState } from 'react'

interface PhotoMgrProps {
  open: boolean
  onClose: () => void
}

export function PhotoMgrModal(props: PhotoMgrProps) {
  const { open, onClose } = props
  const [orderNumber, setOrderNumber] = useState('')
  const { getTasksByOrderNumber, clearTasks } = useMinioUpload()
  const { id: orderId } = useOrderInfoContext()

  function handleBeforeClose() {
    const tasks = getTasksByOrderNumber(orderNumber)

    const hasStart = tasks.some(task => task.status === 'uploading')

    // 如果有任务正在上传，关闭Modal时不清除任务
    if (!hasStart) {
      clearTasks(orderNumber)
    }

    onClose()
  }

  useEffect(() => {
    if (!orderId) {
      return
    }

    if (!open)
      return
    getOrderDetailById(orderId).then((res) => {
      setOrderNumber(res.data.orderNumber)
    })
  }, [open, orderId])

  return (
    <Drawer
      open={open}
      title="照片管理"
      width="90%"
      getContainer={false}
      onClose={handleBeforeClose}
      styles={{
        body: { overflow: 'hidden' },
      }}
      destroyOnClose
    >
      <ImageGallery orderId={orderId} orderNumber={orderNumber} />
    </Drawer>
  )
}
