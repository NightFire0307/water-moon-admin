import type { TableProps } from 'antd/lib'
import type { IOrderResult } from '@/types/order'
import { Button, Drawer, Space, Table, Tag } from 'antd'
import { Download, DownloadIcon, ZoomInIcon } from 'lucide-react'
import { type FC, useEffect, useState } from 'react'
import { getOrderResult } from '@/apis/order'
import { useOrderStore } from '@/store/useOrderStore'
import styles from './OrderPhotoReviewResultModal.module.less'

interface PhotoReviewResultProps {
  open: boolean
  onClose?: () => void
}

export const OrderPhotoReviewResultModal: FC<PhotoReviewResultProps> = ({ open, onClose }) => {
  const [originalData, setOriginalData] = useState<IOrderResult[]>([])
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false)
  const { orderInfo } = useOrderStore()

  const columns: TableProps<IOrderResult>['columns'] = [
    {
      dataIndex: 'thumbnailUrl',
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
      dataIndex: 'fileName',
      title: '编号',
      render: (name) => {
        return <span style={{ fontWeight: 500 }}>{name}</span>
      },
    },
    {
      dataIndex: 'orderProducts',
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

  const fetchOrderResult = async () => {
    if (!orderInfo)
      return
    const { data } = await getOrderResult(orderInfo.id)
    setOriginalData(data.list)
  }

  // 导出选片记录
  const handleExport = async () => {
    try {
      setDownloadLoading(true)
      window.open(`${import.meta.env.VITE_API_BASE_URL}/admin/orders/${orderInfo?.id}/result/download`, '_blank')
      setDownloadLoading(false)
    }
    catch (e) {
      console.error(e)
    }
    finally {
      setDownloadLoading(false)
    }
  }

  useEffect(() => {
    if (open && orderInfo) {
      fetchOrderResult()
    }
  }, [open, orderInfo])

  return (
    <Drawer
      title={`订单 WK-${orderInfo?.orderNumber} 选片结果`}
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

      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={originalData} rowKey="id" />
      </div>

    </Drawer>
  )
}
