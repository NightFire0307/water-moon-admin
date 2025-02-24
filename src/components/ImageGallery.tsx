import type { IPhoto } from '@/types/photo.ts'
import type { UploadProps } from 'antd'
import { getPhotosByOrderId, removePhotos, updatePhotosRecommend } from '@/apis/photo.ts'
import CustomMask from '@/components/CustomMask.tsx'
import { useMinioUpload } from '@/store/useMinioUpload.tsx'
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, ConfigProvider, Divider, Flex, Image, message, Popconfirm, Progress, Space, Upload } from 'antd'
import cs from 'classnames'
import { useEffect, useState } from 'react'
import styles from './ImageGallery.module.less'

// 上传进度
function UploadProgress(props: { percent: number, fileName: string }) {
  const { percent, fileName } = props

  return (
    <div className={styles['upload-progress-wrapper']}>
      <div className={styles['upload-progress']}>
        <ConfigProvider theme={{
          components: {
            Progress: {
              circleTextColor: '#fff',
            },
          },
        }}
        >
          <Progress percent={percent * 100} type="circle" />
        </ConfigProvider>
      </div>
      <div className={styles['upload-text']}>{fileName}</div>
    </div>
  )
}

interface ImageGalleryProps {
  orderId: number
  orderNumber: string
}

export function ImageGallery(props: ImageGalleryProps) {
  const { orderId, orderNumber } = props
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [photosList, setPhotoList] = useState<IPhoto[]>([])
  const { generateUploadTask, removeUploadTask, uploadQueue } = useMinioUpload()

  useEffect(() => {
    fetchPhotos()
  }, [orderId])

  const uploadProps: UploadProps = {
    // action: postData.postURL,
    // data: postData.formData,
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      generateUploadTask(file, { orderId, orderNumber })
      return false
    },
  }

  async function fetchPhotos() {
    const { data } = await getPhotosByOrderId({ orderId, pageSize: 20 })
    setPhotoList(data.list)
  }

  function handleSelect(photoId: number) {
    setSelectedPhotos((prev) => {
      const index = prev.indexOf(photoId)
      if (index > -1) {
        return prev.filter(id => id !== photoId)
      }
      return [...prev, photoId]
    })
  }

  function handleSelectAll() {
    setSelectedPhotos((prev) => {
      if (prev.length === photosList.length) {
        return []
      }
      return photosList.map(photo => photo.id)
    })
  }

  async function handleUpdateRecommend(photoId: number | number[], isRecommended: boolean) {
    const { msg } = await updatePhotosRecommend(orderId, { photoIds: Array.isArray(photoId) ? photoId : [photoId], isRecommended })
    await fetchPhotos()
    message.success(msg)
    setSelectedPhotos([])
  }

  async function handleRemove(photoIds: number | number[]) {
    const ids = Array.isArray(photoIds) ? photoIds : [photoIds]
    await removePhotos(orderId, { photoIds: ids })
    await fetchPhotos()
  }

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/admin/photos/completions')
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as IPhoto
      console.log(data)

      // 更新照片列表
      setPhotoList(prev => [data, ...prev])
      // 移除上传队列
      data.uid && removeUploadTask(data.uid)
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
          <Button
            icon={selectedPhotos.length === photosList.length ? <CheckSquareOutlined /> : <BorderOutlined />}
            onClick={handleSelectAll}
            disabled={photosList.length === 0}
          >
            {
              selectedPhotos.length === photosList.length && photosList.length !== 0 ? '取消全选' : '全选'
            }
          </Button>
          <Button icon={<ClearOutlined />} onClick={() => setSelectedPhotos([])}>清空选中</Button>
          <Button color="gold" variant="solid" icon={<StarFilled />} onClick={() => handleUpdateRecommend(selectedPhotos, true)}>标记精选</Button>
          <Button color="gold" variant="outlined" icon={<StarOutlined />} onClick={() => handleUpdateRecommend(selectedPhotos, false)}>取消精选</Button>
          <Popconfirm placement="left" title={`确定删除选中的${selectedPhotos.length}张照片吗？`} onConfirm={() => handleRemove(selectedPhotos)} okText="确定" cancelText="取消">
            <Button icon={<DeleteOutlined />} danger disabled={selectedPhotos.length === 0}>删除</Button>
          </Popconfirm>
        </Space>
        <Space>
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />}>上传照片</Button>
          </Upload>
        </Space>
      </Flex>
      <Divider />
      <div className={styles['photos-preview']}>
        {
          uploadQueue.map(task => (
            <UploadProgress percent={task.progress} fileName={task.fileName} key={task.uid} />
          ))
        }
        {
          photosList.map(photo => (
            <div
              className={cs(styles['photos-preview-item'], selectedPhotos.includes(photo.id) && styles.select)}
              key={photo.id}
            >
              <Image
                style={{ borderRadius: '8px', objectFit: 'contain' }}
                src={photo.thumbnail_url}
                alt="placeholder"
                height={250}
                preview={{
                  src: photo.original_url,
                  mask: (
                    <CustomMask
                      photoId={photo.id}
                      isSelect={selectedPhotos.includes(photo.id)}
                      isRecommend={photo.is_recommend}
                      onSelect={handleSelect}
                      onRecommend={handleUpdateRecommend}
                      onRemove={handleRemove}
                    />
                  ),
                  maskClassName: styles['custom-mask'],
                }}
              />
              {
                photo.is_recommend && <StarFilled style={{ color: 'gold', position: 'absolute', top: '8px', right: '8px' }} />
              }
              <span style={{ fontWeight: 500, textAlign: 'center' }}>
                { photo.file_name }
              </span>
            </div>
          ))
        }
      </div>
    </>
  )
}
