import type { PhotoWithUid } from '@/store/useMinioUpload.tsx'
import type { IPhoto } from '@/types/photo.ts'
import type { UploadProps } from 'antd'
import { getPhotosByOrderId, removePhotos } from '@/apis/photo.ts'
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
import { Button, Checkbox, ConfigProvider, Divider, Flex, Image, message, Popconfirm, Progress, Space, Upload } from 'antd'
import cs from 'classnames'
import { useEffect, useState } from 'react'
import styles from './ImageGallery.module.less'

interface CustomMaskProps {
  isRecommend: boolean
  isSelect: boolean
  photoId: number
  onSelect: (photoId: number) => void
  onRemove: (photoId: number) => void
  onRecommend: (photoId: number) => void
  onUnRecommend: (photoId: number) => void
}

function CustomMask(props: CustomMaskProps) {
  const { isRecommend, photoId, isSelect, onRecommend, onUnRecommend, onRemove, onSelect } = props

  return (
    <div className={styles['custom-mask-content']}>
      <Checkbox
        checked={isSelect}
        onChange={() => onSelect(photoId)}
        onClick={e => e.stopPropagation()}
      />
      <div className={styles['star-group']} onClick={e => e.stopPropagation()}>
        {
          isRecommend
            ? <Button type="text" icon={<StarOutlined />} shape="circle" style={{ color: 'gold' }} onClick={() => onUnRecommend(photoId)} />
            : <Button type="text" icon={<StarFilled />} shape="circle" style={{ color: 'gold' }} onClick={() => onRecommend(photoId)} />
        }
        <Popconfirm title="确定删除这张照片吗？" onConfirm={() => onRemove(photoId)} okText="确定" cancelText="取消">
          <Button type="text" icon={<DeleteOutlined />} shape="circle" danger />
        </Popconfirm>
      </div>
    </div>
  )
}

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
      generateUploadTask(file, { orderId, orderNumber }, { onUploadComplete: handleUploadComplete })
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

  function handleRecommend(photoId: number | number[]) {
    setPhotoList((prev) => {
      const ids = Array.isArray(photoId) ? photoId : [photoId]
      if (ids.length === 0) {
        message.info('请选择要标记的照片')
        return [...prev]
      }

      ids.forEach((id) => {
        const photo = prev.find(photo => photo.id === id)
        if (photo) {
          photo.is_recommend = true
        }
      })
      return [...prev]
    })
  }

  function handleUnRecommend(photoId: number | number[]) {
    setPhotoList((prev) => {
      const ids = Array.isArray(photoId) ? photoId : [photoId]
      if (ids.length === 0) {
        message.info('请选择要取消标记的照片')
        return [...prev]
      }

      ids.forEach((id) => {
        const photo = prev.find(photo => photo.id === id)
        if (photo) {
          photo.is_recommend = false
        }
      })
      return [...prev]
    })
  }

  function handleRemove(photoId: number) {
    setPhotoList((prev) => {
      return prev.filter(photo => photo.id !== photoId)
    })

    setSelectedPhotos((prev) => {
      return prev.filter(id => id !== photoId)
    })
  }

  async function handleRemoveSelect() {
    await removePhotos(orderId, { photoIds: selectedPhotos })
    await fetchPhotos()
  }

  function handleUploadComplete(fileList: PhotoWithUid[]) {
    console.log(fileList)
    // setPhotoList(prev => [...prev, ...fileList])
    // fileList.forEach(file => removeUploadTask(file.uid))
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
          <Button color="gold" variant="solid" icon={<StarFilled />} onClick={() => handleRecommend(selectedPhotos)}>标记精选</Button>
          <Button color="gold" variant="outlined" icon={<StarOutlined />} onClick={() => handleUnRecommend(selectedPhotos)}>取消精选</Button>
          <Popconfirm placement="left" title={`确定删除选中的${selectedPhotos.length}张照片吗？`} onConfirm={handleRemoveSelect} okText="确定" cancelText="取消">
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
                      onRecommend={handleRecommend}
                      onUnRecommend={handleUnRecommend}
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
