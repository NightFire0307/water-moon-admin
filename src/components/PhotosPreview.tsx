import type { IPhoto } from '@/types/photo.ts'
import { BorderOutlined, CheckSquareOutlined, DeleteOutlined, StarFilled, StarOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Image, Popconfirm, Space } from 'antd'
import { useState } from 'react'
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
    <div className={styles['custom-mask']}>
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

  const [photosList, setPhotoList] = useState<IPhoto[]>(Array.from({ length: 50 }).map((_, index) => ({
    id: index + 1,
    oss_url: '/src/assets/placeholder.svg',
    is_recommend: false,
    is_selected: false,
    created_at: '',
    updated_at: '',
  })))

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

  function handleRecommend(photoId: number) {
    setPhotoList((prev) => {
      const photo = photosList.find(photo => photo.id === photoId)
      if (photo) {
        photo.is_recommend = true
      }
      return [...prev]
    })
  }

  function handleUnRecommend(photoId: number) {
    setPhotoList((prev) => {
      const photo = photosList.find(photo => photo.id === photoId)
      if (photo) {
        photo.is_recommend = false
      }
      return [...prev]
    })
  }

  function handleRemove(photoId: number) {
    setPhotoList((prev) => {
      return prev.filter(photo => photo.id !== photoId)
    })
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
          <Button color="gold" icon={<StarOutlined />}>标记精选</Button>
        </Space>
        <Button icon={<DeleteOutlined />} danger>删除</Button>
      </Flex>
      <Divider />
      <div className={styles['photos-preview']}>
        {
          photosList.map(photo => (
            <div
              style={{
                display: 'inline-block',
                position: 'relative',
                border: selectedPhotos.includes(photo.id) ? '2px solid #597ef7' : 'none',
              }}
              key={photo.id}
            >
              <Image
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
                }}
              />
              {
                photo.is_recommend && <StarFilled style={{ color: 'gold', position: 'absolute', top: '8px', right: '8px' }} />
              }
            </div>
          ))
        }
      </div>
    </>
  )
}
