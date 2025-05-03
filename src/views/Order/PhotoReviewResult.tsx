import type { TableProps } from 'antd/lib'
import type { FC } from 'react'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { Button, Divider, Drawer, Flex, Space, Table, Tag } from 'antd'
import { Download, DownloadIcon, Filter, Grid3x3, List as ListIcon, ZoomInIcon } from 'lucide-react'

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

  const columns: TableProps['columns'] = [
    {
      dataIndex: 'thumbnail_url',
      title: '照片',
    },
    {
      dataIndex: 'name',
      title: '编号',
    },
    {
      dataIndex: 'orderProduct',
      title: '所选产品',
      render: (orderProduct) => {
        return (
          orderProduct.map(product => (
            <Tag key={product.id}>{product.name}</Tag>
          ))
        )
      },
    },
    {
      dataIndex: 'status',
      title: '状态',
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

  const data = [
    {
      thumbnail_url: 'xxx',
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
    },
  ]

  return (
    <Drawer
      title="订单 WK-D1919 选片结果"
      open={open}
      onClose={() => onClose && onClose()}
      width={900}
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
