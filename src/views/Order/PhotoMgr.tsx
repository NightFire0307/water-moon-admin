import { ImageGallery } from '@/components/ImageGallery.tsx'
import { Drawer } from 'antd'

interface PhotoMgrProps {
  open: boolean
  orderId: number
  orderNumber: string
  onClose: () => void
}

export function PhotoMgr(props: PhotoMgrProps) {
  const { open, orderId, orderNumber, onClose } = props

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
