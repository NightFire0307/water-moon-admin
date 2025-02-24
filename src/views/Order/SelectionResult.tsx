import type { IPhoto } from '@/types/photo.ts'
import type { MenuProps, TabsProps } from 'antd'
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined, PictureOutlined } from '@ant-design/icons'
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
        photos.map(_ => (
          <Image
            alt="placeholder"
            src="/src/assets/placeholder.svg"
          />
        ))
      }
    </div>
  )
}

export function SelectionResult() {
  const { orderId } = useParams<{ orderId: string }>()
  const [tabsItem, setTabsItem] = useState<TabsProps['items']>([])

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
    console.log(orderId)

    setTabsItem([
      {
        label: '全部 (10)',
        key: 'all',
        children: <ImageGrid photos={Array.from({ length: 30 })} />,
      },
      {
        label: '未选 (0)',
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
              导出选片结果为
            </Dropdown.Button>
            <Button icon={<DownloadOutlined />}>打包下载</Button>
          </Space>
        )}
      />
    </div>
  )
}
