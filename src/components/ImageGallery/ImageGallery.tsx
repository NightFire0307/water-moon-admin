import {
  ClearOutlined,
} from '@ant-design/icons'
import { Button, Divider, Empty, Flex, message, Modal, Space, Spin, Image, Card } from 'antd'
import { UploadIcon } from 'lucide-react'
import { getPhotosByOrderId, removeAllPhotos } from '@/apis/photo.ts'
import { uploadStore } from '@/store/uploadStore'
import { useEffect } from 'react'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import type { GetPhotoListResult } from '@/types/photo'

const { Meta } = Card

interface ImageGalleryProps {
  orderId: number
  orderNumber: string
}

export function ImageGallery(props: ImageGalleryProps) {
  const { orderId } = props
  const { openTaskCenter } = uploadStore()
  const { observerRef, hasMore, data, reload } = useInfiniteScroll<GetPhotoListResult>(
    (page, pageSize) => getPhotosByOrderId({ orderId, current: page, pageSize }),
    {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px',
      pageSize: 20,
    },
  )
  

  // 清空所有照片
  async function handleRemoveAllPhoto() {
    Modal.confirm({
      title: '确认清空所有照片吗？',
      content: '清空后，照片将无法恢复！',
      centered: true,
      okText: '确认',
      onOk: async () => {
        const { msg } = await removeAllPhotos(orderId)
        message.success(msg)
        // 重新加载照片列表
        reload()
      },
    })
  }

  useEffect(() => {
    getPhotosByOrderId({ orderId, current: 1, pageSize: 50})
  }, [])

  return (
    <>
      <Flex justify="space-between">
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleRemoveAllPhoto} danger>清空所有照片</Button>
        </Space>
        <Space>
          <Button
            type="primary"
            icon={<UploadIcon size={16} />}
            onClick={openTaskCenter}
          >
            创建上传任务
          </Button>
        </Space>
      </Flex>
      <Divider />
      <div
        style={{ height: 'calc(100% - 82px)', overflowY: 'auto' }}
      >
        {
          data.length === 0
            ? <Empty description="暂无照片" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            : <Flex align='center' wrap gap={16}>
              {
                data.map(photo => (
                  <Card
                    key={photo.uid}
                    hoverable
                    style={{ width: 250 }}
                    cover={
                      <img height={250} style={{ objectFit: 'contain'}} draggable={false} src={photo.ossUrlThumbnail} alt={photo.name} />
                    }
                  >
                    <Meta title={photo.name}  />
                  </Card>
                ))
              }
            </Flex>
        }

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {
          hasMore
            ? (
                <div ref={observerRef}>
                  <Spin size='large' />
                </div>
              )
            : <span style={{ color: '#888' }}>没有更多了</span>
        }
      </div>
      </div>
    </>
  )
}
