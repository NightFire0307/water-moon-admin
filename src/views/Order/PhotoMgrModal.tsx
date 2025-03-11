import { getOrderDetailById } from '@/apis/order.ts'
import { ImageGallery } from '@/components/ImageGallery/ImageGallery.tsx'
import { Drawer } from 'antd'
import { useEffect, useState } from 'react'

interface PhotoMgrProps {
  open: boolean
  orderId: number
  onClose: () => void
}

export function PhotoMgrModal(props: PhotoMgrProps) {
  const { open, orderId, onClose } = props
  const [orderNumber, setOrderNumber] = useState('')

  useEffect(() => {
    if (!open)
      return
    getOrderDetailById(orderId).then((res) => {
      setOrderNumber(res.data.order_number)
    })
  }, [open, orderId])

  return (
    <Drawer
      open={open}
      title="照片管理"
      width="90%"
      getContainer={false}
      onClose={onClose}
      styles={{
        body: { overflow: 'hidden' },
      }}
      destroyOnClose
    >
      <ImageGallery orderId={orderId} orderNumber={orderNumber} />
    </Drawer>
  )
}
