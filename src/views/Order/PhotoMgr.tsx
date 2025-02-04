import { getPhotosByOrderId } from '@/apis/photo.ts'
import { PhotosPreview } from '@/components/PhotosPreview.tsx'
import { BorderOutlined, CheckSquareOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons'
import { Button, Divider, Drawer, Flex, Space } from 'antd'
import { useEffect, useState } from 'react'

interface PhotoMgrProps {
  open: boolean
  orderId: number
  onClose: () => void
}

export function PhotoMgr(props: PhotoMgrProps) {
  const { open, orderId, onClose } = props
  const [isAllSelect, setIsAllSelect] = useState(false)

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
    <Drawer open={open} title="照片管理" width="90%" getContainer={false} onClose={onClose}>
      <Flex justify="space-between">
        <Space>
          <Button
            icon={isAllSelect ? <CheckSquareOutlined /> : <BorderOutlined />}
            onClick={() => setIsAllSelect(prev => !prev)}
          >
            {
              isAllSelect ? '取消全选' : '全选'
            }
          </Button>
          <Button color="gold" icon={<StarOutlined />}>标记精选</Button>
        </Space>
        <Button icon={<DeleteOutlined />} danger>删除</Button>
      </Flex>
      <Divider />
      <PhotosPreview photoList={[]} />
    </Drawer>
  )
}
