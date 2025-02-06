import type { IPhoto } from '@/types/photo.ts'
import {
  BorderOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
} from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Image, message, Popconfirm, Space } from 'antd'
import cs from 'classnames'
import { useEffect, useState } from 'react'
import styles from './PhotoPreview.module.less'

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

export function PhotosPreview() {
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [photosList, setPhotoList] = useState<IPhoto[]>([])

  useEffect(() => {
    fetchPhotos().then((data) => {
      setPhotoList(data)
    })
    console.log('模拟数据')
  }, [])

  function fetchPhotos() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = Array.from({ length: 20 }).map((_, index) => ({
          id: index + 1,
          name: `photo-${index + 1}.jpg`,
          oss_url: '/src/assets/placeholder.svg',
          is_recommend: false,
          is_selected: false,
          created_at: '',
          updated_at: '',
        }))
        resolve(data)
      }, 10)
    })
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

  function handleRemoveSelect() {
    setPhotoList((prev) => {
      return prev.filter(photo => !selectedPhotos.includes(photo.id))
    })

    setSelectedPhotos([])
  }

  return (
    <>
      <Flex justify="space-between">
        <Space>
          <Button
            icon={selectedPhotos.length === photosList.length ? <CheckSquareOutlined /> : <BorderOutlined />}
            onClick={handleSelectAll}
          >
            {
              selectedPhotos.length === photosList.length ? '取消全选' : '全选'
            }
          </Button>
          <Button icon={<ClearOutlined />} onClick={() => setSelectedPhotos([])}>清空选中</Button>
          <Button color="gold" variant="solid" icon={<StarFilled />} onClick={() => handleRecommend(selectedPhotos)}>标记精选</Button>
          <Button color="gold" variant="outlined" icon={<StarOutlined />} onClick={() => handleUnRecommend(selectedPhotos)}>取消精选</Button>
        </Space>
        <Popconfirm placement="left" title={`确定删除选中的${selectedPhotos.length}张照片吗？`} onConfirm={handleRemoveSelect} okText="确定" cancelText="取消">
          <Button icon={<DeleteOutlined />} danger disabled={selectedPhotos.length === 0}>删除</Button>
        </Popconfirm>
      </Flex>
      <Divider />
      <div className={styles['photos-preview']}>
        {
          photosList.map(photo => (
            <div
              className={cs(styles['photos-preview-item'], selectedPhotos.includes(photo.id) && styles.select)}
              key={photo.id}
            >
              <Image
                style={{ borderRadius: '8px' }}
                src={photo.oss_url}
                alt="placeholder"
                preview={{
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
                { photo.name }
              </span>
            </div>
          ))
        }
      </div>
    </>
  )
}
