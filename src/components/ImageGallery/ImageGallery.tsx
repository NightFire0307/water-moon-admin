import type { GetPhotoListResult } from '@/types/photo.ts'
import type { UploadProps } from 'antd'
import type { ReactNode } from 'react'
import { getPhotosByOrderId, removeAllPhotos } from '@/apis/photo.ts'
import useInfiniteScroll from '@/hooks/useInfiniteScroll'
import { type UploadStatus, useMinioUpload } from '@/store/useMinioUpload'
import {
  CheckCircleTwoTone,
  ClearOutlined,
  ClockCircleTwoTone,
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Card, Divider, Flex, Image, message, Modal, Progress, Space, Typography, Upload } from 'antd'

import { CameraIcon } from 'lucide-react'

import { useEffect, useState } from 'react'

import styles from './ImageGallery.module.less'

// 图片组件
function PhotoItem(props: { fileName: string, status: UploadStatus, percent?: number, ossUrls: { ossUrlMedium?: string, ossUrlThumbnail?: string } }) {
  const { percent, fileName, status, ossUrls } = props
  const [displayStatus, setDisplayStatus] = useState<UploadStatus>(status)

  const statusMap: Record<string, { statusNode: ReactNode, statusText: string, statusContent: ReactNode }> = {
    pending: {
      statusNode: <ClockCircleTwoTone twoToneColor="#faad14" style={{ fontSize: 20, marginRight: 8 }} />,
      statusText: '待上传',
      statusContent: (
        <Progress
          percent={Math.round(percent ? percent * 100 : 0)}
          type="circle"
          status={status === 'uploading' ? 'active' : undefined}
        />
      ),
    },
    compress: {
      statusNode: <LoadingOutlined style={{ color: '#faad14', fontSize: 20, marginRight: 8 }} spin />,
      statusText: '压缩中',
      statusContent: <LoadingOutlined style={{ fontSize: 48, color: '#595959' }} spin />,
    },
    uploading: {
      statusNode: <LoadingOutlined style={{ color: '#1890ff', fontSize: 20, marginRight: 8 }} spin />,
      statusText: '上传中',
      statusContent: (
        <Progress
          percent={Math.round(percent ? percent * 100 : 100)}
          type="circle"
        />
      ),
    },
    done: {
      statusNode: <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 20, marginRight: 8 }} />,
      statusText: '已上传',
      statusContent: (
        <Image
          src={ossUrls.ossUrlThumbnail}
          alt={fileName}
          height={194}
          width="100%"
          style={{
            maxHeight: '100%',
            objectFit: 'contain',
          }}
          preview={{
            src: ossUrls.ossUrlMedium,
          }}
        />
      ),
    },
  }

  useEffect(() => {
    if (status === 'done' && percent === 0.1) {
      const timer = setTimeout(() => {
        setDisplayStatus('done')
      }, 800)

      return () => clearTimeout(timer)
    }
    else {
      setDisplayStatus(status)
    }
  }, [status])

  const { statusNode, statusText, statusContent } = statusMap[displayStatus] ?? { node: null, text: '' }

  return (
    <div>
      <Card
        size="small"
        style={{ width: 250, height: 250, background: '#fafafa', boxShadow: '0 2px 8px #f0f1f2' }}
        styles={{
          body: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          {statusNode}
          <Typography.Text strong>{statusText}</Typography.Text>
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {statusContent}
        </div>

      </Card>
      <div style={{ marginTop: 8, textAlign: 'center', wordBreak: 'break-all' }}>
        <Typography.Text strong ellipsis>{fileName}</Typography.Text>
      </div>
    </div>
  )
}

interface ImageGalleryProps {
  orderId: number
  orderNumber: string
}

export function ImageGallery(props: ImageGalleryProps) {
  const { orderId, orderNumber } = props
  const { observerRef, hasMore, data } = useInfiniteScroll<GetPhotoListResult>(
    (page, pageSize) => getPhotosByOrderId({ orderId, current: page, pageSize }),
    {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px',
      pageSize: 20,
    },
  )
  const { addTask, startUpload, setTaskOssUrl, isUploading, getTasksByOrderNumber } = useMinioUpload()
  const orderTasks = getTasksByOrderNumber(orderNumber)

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isJPG = file.type === 'image/jpeg'
      if (!isJPG) {
        message.error(`${file.name} 不是 JPG 格式的文件`)
      }
      else {
        addTask(file, { orderId, orderNumber })
      }

      return false
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
        await removeAllPhotos(orderId)
      },
    })
  }

  // 使用 SSE 实时接收照片上传完成事件
  // 注意：此处的 URL 需要根据实际情况调整
  useEffect(() => {
    const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/admin/photos/completions`)
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'done') {
        const { uid, orderNumber, ossUrlMedium, ossUrlThumbnail } = data
        setTaskOssUrl(orderNumber, uid, { ossUrlMedium, ossUrlThumbnail })
      }
    }

    eventSource.onerror = (error) => {
      console.log('sse error', error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
      console.log('sse关闭')
    }
  }, [])

  return (
    <>
      <Flex justify="space-between">
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleRemoveAllPhoto} danger>清空所有照片</Button>
        </Space>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => startUpload(orderNumber, orderId)}
            loading={isUploading}
            disabled={orderTasks.length === 0}
          >
            开始上传
          </Button>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<CameraIcon size={16} />} loading={isUploading}>上传照片</Button>
          </Upload>
        </Space>
      </Flex>
      <Divider />
      <div
        style={{ height: 'calc(100% - 82px)', overflowY: 'auto' }}
      >
        <div className={styles['photos-preview']}>
          {
            orderTasks.map(task => (
              <PhotoItem
                percent={task.progress}
                fileName={task.fileName}
                key={task.uid}
                status={task.status}
                ossUrls={{ ossUrlMedium: task.ossUrlMedium, ossUrlThumbnail: task.ossUrlThumbnail }}
              />
            ))
          }

          {
            data.map(item => (
              <PhotoItem
                key={item.id}
                percent={1}
                fileName={item.name}
                status="done"
                ossUrls={{ ossUrlMedium: item.ossUrlMedium, ossUrlThumbnail: item.ossUrlThumbnail }}
              />
            ))
          }
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          {
            hasMore
              ? (
                  <div ref={observerRef}>
                    <LoadingOutlined spin />
                    <span>加载更多</span>
                  </div>
                )
              : <span style={{ color: '#888' }}>没有更多了</span>
          }
        </div>
      </div>
    </>
  )
}
