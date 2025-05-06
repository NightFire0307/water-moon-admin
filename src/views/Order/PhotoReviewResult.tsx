import type { TableProps } from 'antd/lib'
import { getOrderResult } from '@/apis/order'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { Button, Divider, Drawer, Flex, Space, Table, Tag } from 'antd'
import { Download, DownloadIcon, Filter, Grid3x3, List as ListIcon, ZoomInIcon } from 'lucide-react'
import { type FC, useEffect } from 'react'
import styles from './PhotoReviewResult.module.less'

interface OrderProduct {
  id: number
  name: string
}

interface DataType {
  photoId: number
  thumbnail_url: string
  name: string
  orderProduct: OrderProduct[]
  remark: string
  status: 'selected' | 'unSelected'
}

interface PhotoReviewResultProps {
  open: boolean
  onClose?: () => void
}

const PhotoReviewResult: FC<PhotoReviewResultProps> = ({ open, onClose }) => {
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
    },
  ]

  const columns: TableProps<DataType>['columns'] = [
    {
      dataIndex: 'thumbnail_url',
      title: '照片',
      render: (src) => {
        return <img src={src} alt="缩略图" style={{ width: '35px' }} />
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
      dataIndex: 'orderProduct',
      title: '所选产品',
      render: (orderProduct: OrderProduct[]) => {
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

  const data: DataType[] = [
    {
      photoId: 1,
      thumbnail_url: 'http://192.168.26.246:9090/water-moon/D1212/thumbnail_6M4A3374?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=YJV7PFvKGTnYaFEdPcBi%2F20250505%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250505T072831Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=933ca4b35221bc0d6d789acba3131d0d636b4fac5ba1cf10383aebb6ea070444',
      name: 'DSC_034A34',
      orderProduct: [
        {
          id: 1,
          name: '缘定今生14寸相册',
        },
        {
          id: 2,
          name: '7寸单片',
        },
      ],
      status: 'selected',
      remark: '头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下头发需要修饰一下',
    },
  ]

  const fetchOrderResult = async () => {
    const { data } = await getOrderResult(35)
    console.log(data)
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
      extra={
        <Button type="primary" icon={<Download size={14} />}>导出照片</Button>
      }
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Flex justify="space-between" style={{ padding: '16px 24px' }}>
        <SimpleForm layout="inline" fields={formFields} initialValues={{ selectedStatus: 'all' }} />
        <Space>
          <Button icon={<Grid3x3 size={14} />}>网格视图</Button>
          <Button icon={<ListIcon size={14} />}>列表视图</Button>
        </Space>
      </Flex>
      <Divider style={{ margin: 0 }} />

      <div style={{ padding: '24px' }}>
        <Table columns={columns} dataSource={data} />
      </div>

    </Drawer>
  )
}

export default PhotoReviewResult
