import type { UploadProps } from 'antd'
import type { TableProps } from 'antd/lib'
import {
  ClearOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Divider, Flex, message, Modal, Progress, Space, Image, Table, Tag, Upload, Typography } from 'antd'
import { CameraIcon } from 'lucide-react'
import { useEffect} from 'react'
import { removeAllPhotos } from '@/apis/photo.ts'
import { type UploadPhoto, type UploadStatus, uploadStore } from '@/store/uploadStore'

const { Link } = Typography

interface ImageGalleryProps {
  orderId: number
  orderNumber: string
}

export function ImageGallery(props: ImageGalleryProps) {
  const { orderId, orderNumber } = props
  const { createUploadOrder, getUploadPhotosByOrderId, startUpload, abortPhoto, createPreviewUrl } = uploadStore()

  const uploadPhotos = getUploadPhotosByOrderId(String(orderId))?.photos || []

  const columns: TableProps<UploadPhoto>['columns'] = [
    {
      title: '缩略图',
      dataIndex: 'previewUrl',
      render: (url, record) => {
        return <Image 
          src={url ? url : URL.createObjectURL(record.file)} 
          width={80}
          height={60} // 固定高度
          style={{ objectFit: 'contain' }}
        />
      }
    },
    {
      title: '照片名称',
      dataIndex: ['file', 'name'],
      render: (name: string) => name.split('.')[0],
    },
    {
      title: '上传进度',
      dataIndex: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          percentPosition={{ align: 'center', type: 'inner' }}
          strokeColor={
            progress === 100 ? '#87d068' : { '0%': '#108ee9', '100%': '#87d068' }
          }
          showInfo={false}
        />
      ),
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: UploadStatus) => {
        switch (status) {
          case 'Pending':
            return <Tag color="default">待上传</Tag>
          case 'Uploading':
            return <Tag color="blue">上传中</Tag>
          case 'Done':
            return <Tag color="green">已完成</Tag>
          case 'Error':
            return <Tag color="red">上传失败</Tag>
          case 'Abort':
            return <Tag color="orange">已中止</Tag>
        }
      },
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && <Link>取消</Link>}
          {record.status === 'Uploading' && <Link type="danger" onClick={() => abortPhoto(record.file.uid)}>中止</Link>}
          {record.status === 'Error' && <Link>重试</Link>}
          {record.status === 'Done' && (
              <Link type="danger">删除</Link>
          )}
        </Space>
      ),
    },
  ]

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isJPG = file.type === 'image/jpeg'
      if (!isJPG) {
        message.error(`${file.name} 不是 JPG 格式的文件`)
      }
      else {
        createUploadOrder(String(orderId), orderNumber, file)
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
        const { msg } = await removeAllPhotos(orderId)
        message.success(msg)
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
        // setTaskOssUrl(orderNumber, uid, { ossUrlMedium, ossUrlThumbnail })
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
            onClick={() => startUpload(String(orderId))}
          >
            开始上传
          </Button>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<CameraIcon size={16} />}>上传照片</Button>
          </Upload>
        </Space>
      </Flex>
      <Divider />
      <div
        style={{ height: 'calc(100% - 82px)', overflowY: 'auto' }}
      >
        <Table 
          rowKey={record => record.file.uid} 
          dataSource={uploadPhotos} 
          columns={columns}
          scroll={{ y: 80 * 10}}
        />
      </div>
    </>
  )
}
