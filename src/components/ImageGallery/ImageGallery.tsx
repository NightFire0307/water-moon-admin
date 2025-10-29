import type { GetPhotoListResult } from '@/types/photo'
import {
  ClearOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { Button, Card, Divider, Empty, Flex, message, Modal, Space, Spin, Upload, type UploadProps } from 'antd'
import { UploadIcon } from 'lucide-react'
import { getPhotosByOrderId, removeAllPhotos } from '@/apis/photo.ts'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { useUploadStore } from '@/store/useUploadStore'
import styles from './ImageGallery.module.less'

const { Meta } = Card

interface ImageGalleryProps {
  orderId: number
  orderNumber: string
}

export function ImageGallery(props: ImageGalleryProps) {
  const { orderId, orderNumber } = props
  const { visible, openTaskCenter, createUploadOrder } = useUploadStore()
  const { observerRef, hasMore, data, reload } = useInfiniteScroll<GetPhotoListResult>(
    (page, pageSize) => getPhotosByOrderId({ orderId, current: page, pageSize }),
    {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px',
      pageSize: 20,
    },
  )

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      createUploadOrder(orderId.toString(), orderNumber, file)
      return false
    },
    onChange: () => {
      if (!visible) {
        openTaskCenter()
      }
    },
  }

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

  return (
    <>
      <Flex justify="space-between">
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleRemoveAllPhoto} danger>清空所有照片</Button>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => reload()}>刷新照片</Button>
          <Upload {...uploadProps}>
            <Button
              type="primary"
              icon={<UploadIcon size={16} />}
            >
              添加照片
            </Button>
          </Upload>
        </Space>
      </Flex>
      <Divider />
      <div className={styles['gallery-container']}>
        {
          data.length === 0
            ? <Empty description="暂无照片" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            : (
                <Flex align="center" wrap gap={16}>
                  {
                    data.map((photo, index) => (
                      <Card
                        key={photo.id}
                        hoverable
                        style={{
                          width: 260,
                        }}
                        cover={(
                          <div className={styles['img-preview']}>
                            <img
                              draggable={false}
                              src={photo.ossUrlThumbnail}
                              alt={photo.name}
                            />
                          </div>
                        )}
                        styles={{
                          body: {
                            padding: '16px',
                            background: '#fafafa',
                          },
                        }}
                      >
                        <Meta
                          title={(
                            <div className={styles['card-title']}>
                              {photo.name}
                            </div>
                          )}
                          description={(
                            <div className={styles['card-description']}>
                              第
                              {' '}
                              {index + 1}
                              {' '}
                              张
                            </div>
                          )}
                          style={{ textAlign: 'center' }}
                        />
                      </Card>
                    ))
                  }
                </Flex>
              )
        }

        <div className={styles['loading-container']}>
          {
            hasMore
              ? (
                  <div ref={observerRef}>
                    <Spin size="large" />
                  </div>
                )
              : <span className={styles['no-more']}>没有更多了</span>
          }
        </div>
      </div>
    </>
  )
}
