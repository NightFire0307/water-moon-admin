import { getPhotosByOrderId } from '@/apis/photo.ts'
import { PhotosPreview } from '@/components/PhotosPreview.tsx'
import { Drawer } from 'antd'
import { useEffect } from 'react'

interface PhotoMgrProps {
  open: boolean
  orderId: number
  onClose: () => void
}

export function PhotoMgr(props: PhotoMgrProps) {
  const { open, orderId, onClose } = props

  async function getPhotos() {
    const res = await getPhotosByOrderId({ orderId })
    console.log(res)
  }

  useEffect(() => {
    if (open) {
      getPhotos()
    }
  }, [open])

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
      <PhotosPreview />
    </Drawer>
  )
}
