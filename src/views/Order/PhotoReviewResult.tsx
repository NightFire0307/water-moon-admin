import type { IOrderResultPhoto } from '@/types/order'
import type { TableProps } from 'antd/lib'
import { downloadResult, getOrderResult } from '@/apis/order'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { Button, Divider, Drawer, Flex, Space, Table, Tag } from 'antd'
import { Download, DownloadIcon, Filter, ZoomInIcon } from 'lucide-react'
import { type FC, useEffect, useMemo, useState } from 'react'
import styles from './PhotoReviewResult.module.less'

interface PhotoReviewResultProps {
  open: boolean
  onClose?: () => void
}

const PhotoReviewResult: FC<PhotoReviewResultProps> = ({ open, onClose }) => {
  const [originalData, setOriginalData] = useState<IOrderResultPhoto[]>([])
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'selected' | 'unSelected'>('all')
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false)

  const formFields: FieldSchema[] = [
    {
      type: 'select',
      name: 'selectedStatus',
      prefix: <Filter size={14} />,
      options: [
        {
          label: '全部照片',
          value: 'all',
        },
        {
          label: '已选照片',
          value: 'selected',
        },
        {
          label: '未选照片',
          value: 'unSelected',
        },
      ],
      onChange: (value: 'all' | 'selected' | 'unSelected') => setSelectedStatus(value),
    },
  ]

  const columns: TableProps<IOrderResultPhoto>['columns'] = [
    {
      dataIndex: 'thumbnail_url',
      title: '照片',
      render: (src) => {
        return (
          <div className={styles['img-wrapper']}>
            <img src={src} alt="缩略图" />
          </div>
        )
      },
    },
    {
      dataIndex: 'name',
      title: '编号',
      render: (name) => {
        return <span style={{ fontWeight: 500 }}>{name}</span>
      },
    },
    {
      dataIndex: 'order_products',
      title: '所选产品',
      render: (orderProduct: { id: number, name: string }[]) => {
        return (
          orderProduct.map((product) => {
            return <Tag color="blue" key={product.id}>{product.name}</Tag>
          })
        )
      },
    },
    {
      dataIndex: 'remark',
      title: '客户备注',
      render: remark => <div style={{ fontSize: '12px', maxWidth: '50px' }} className={styles.ellipsis}>{remark}</div>,
    },
    {
      dataIndex: 'status',
      title: '状态',
      render: (status) => {
        return <Tag color={status === 'selected' ? 'success' : 'red'}>{ status === 'selected' ? '已选中' : '未选中' }</Tag>
      },
    },
    {
      title: '操作',
      render: () => {
        return (
          <Space>
            <Button type="text" icon={<ZoomInIcon size={18} />} />
            <Button type="text" icon={<DownloadIcon size={18} />} />
          </Space>
        )
      },
    },
  ]

  const filteredData = useMemo(() => {
    return originalData.filter((photo) => {
      if (selectedStatus === 'all') {
        return true
      }

      if (photo.status === selectedStatus) {
        return true
      }

      return false
    })
  }, [originalData, selectedStatus])

  const fetchOrderResult = async () => {
    const { data } = await getOrderResult(35)
    setOriginalData(data.list.photos)
  }

  // 导出选片记录
  const handleExport = async () => {
    setDownloadLoading(true)
    const data = await downloadResult(35)
    const blob = new Blob([data], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = '订单选片结果.zip'
    a.click()
    URL.revokeObjectURL(url)
    setDownloadLoading(false)
  }

  useEffect(() => {
    if (open) {
      fetchOrderResult()
    }
  }, [open])

  return (
    <Drawer
      title="订单 WK-D1919 选片结果"
      open={open}
      onClose={() => onClose && onClose()}
      width={1000}
      extra={(
        <Button
          type="primary"
          icon={<Download size={14} />}
          onClick={handleExport}
          loading={downloadLoading}
        >
          导出照片
        </Button>
      )}
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Flex justify="space-between" style={{ padding: '16px 24px' }}>
        <SimpleForm layout="inline" fields={formFields} initialValues={{ selectedStatus: 'all' }} />
      </Flex>
      <Divider style={{ margin: 0 }} />

      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={filteredData} rowKey="id" />
      </div>

    </Drawer>
  )
}

export default PhotoReviewResult
