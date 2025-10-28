import { Drawer } from 'antd'
import { useEffect, useState } from 'react'
import { getOrderDetailById } from '@/apis/order.ts'
import { ImageGallery } from '@/components/ImageGallery/ImageGallery.tsx'
import { useMinioUpload } from '@/store/useMinioUpload.ts'
import { useOrderStore } from '@/store/useOrderStore'

interface PhotoMgrProps {
  open: boolean
  onClose: () => void
}

export function OrderPhotoMgrModal(props: PhotoMgrProps) {
  const { open, onClose } = props
  const [orderNumber, setOrderNumber] = useState('')
  const { getTasksByOrderNumber, clearTasks } = useMinioUpload()
  const { orderInfo } = useOrderStore()

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
    if (!orderInfo) {
      return
    }

    if (!open)
      return
    getOrderDetailById(orderInfo.id).then((res) => {
      setOrderNumber(res.data.orderNumber)
    })
  }, [open, orderInfo])

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
      destroyOnHidden
    >
      {
        orderInfo === null
          ? <div>加载中</div>
          : <ImageGallery orderId={orderInfo.id} orderNumber={orderNumber} />
      }
    </Drawer>
  )
}
