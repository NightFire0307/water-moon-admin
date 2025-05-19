import type { IPhoto } from '@/types/photo.ts'
import type { MenuProps, TabsProps } from 'antd'
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Image, Space, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './SelectionResult.module.less'

interface ImageGridProps {
  photos: IPhoto[]
}

function ImageGrid(props: ImageGridProps) {
  const { photos } = props
  return (
    <div className={styles['image-grid']}>
      {
        photos.map(photo => (
          <div style={{ position: 'relative' }}>
            <Image
              alt="placeholder"
              src={photo.thumbnail_url}
              preview={{
                mask: null,
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '6px', fontWeight: 'bold' }}>照片名称</div>
            <div style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '18px' }}>
              <Space direction="vertical">
                <StarOutlined />
                <InfoCircleOutlined style={{ cursor: 'pointer' }} />
              </Space>
            </div>
          </div>
        ))
      }
    </div>
  )
}

export function SelectionResult() {
  const { orderId } = useParams<{ orderId: string }>()
  const [tabsItem, setTabsItem] = useState<TabsProps['items']>([])
  const [photos, setPhotos] = useState<IPhoto[]>([])

  const outPutItems: MenuProps['items'] = [
    {
      label: 'PDF',
      key: 'pdf',
      icon: <FilePdfOutlined />,
    },
    {
      label: 'JPG',
      key: 'jpg',
      icon: <PictureOutlined />,
    },
    {
      label: 'Excel',
      key: 'excel',
      icon: <FileExcelOutlined />,
      disabled: true,
    },
  ]

  useEffect(() => {
    console.log('orderId', orderId)
    setPhotos(() => {
      const newPhotos: IPhoto[] = []
      for (let i = 0; i < 10; i++) {
        newPhotos.push({
          id: i,
          file_name: `照片名称${i}`,
          thumbnail_url: '/src/assets/placeholder.svg',
          original_url: '/src/assets/placeholder.svg',
          is_recommend: false,
        })
      }
      return newPhotos
    })

    setTabsItem([
      {
        label: '全部 (10)',
        key: 'all',
        children: <ImageGrid photos={photos} />,
      },
      {
        label: '未选 (10)',
        key: 'unselected',
        children: 'Content of Tab Pane 4',
      },
      {
        label: '已选 (0)',
        key: 'selected',
        children: 'Content of Tab Pane 5',
      },
    ])
  }, [])

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Tabs
        className={styles['custom-tabs']}
        items={tabsItem}
        tabBarExtraContent={(
          <Space>
            <Dropdown.Button
              menu={{ items: outPutItems }}
              type="primary"
            >
              导出结果为
            </Dropdown.Button>
            <Button icon={<DownloadOutlined />}>打包下载</Button>
          </Space>
        )}
      />
    </div>
  )
}
