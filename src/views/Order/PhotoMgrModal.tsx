import { getOrderDetailById } from '@/apis/order.ts'
import { ImageGallery } from '@/components/ImageGallery/ImageGallery.tsx'
import { Drawer } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { OrderIdContext } from './components/core/Order'

interface PhotoMgrProps {
  open: boolean
  onClose: () => void
}

export function PhotoMgrModal(props: PhotoMgrProps) {
  const { open, onClose } = props
  const [orderNumber, setOrderNumber] = useState('')
  const orderId = useContext(OrderIdContext)

  useEffect(() => {
    if (!orderId) {
      return
    }

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
