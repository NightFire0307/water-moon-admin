import type { FC } from 'react'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { Button, Divider, Drawer, Flex, List, Space } from 'antd'
import { Download, Filter, Grid3x3, List as ListIcon } from 'lucide-react'

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

  const data = [
    {
      title: '照片-01',
    },
    {
      title: '照片-02',
    },
    {
      title: '照片-03',
    },
    {
      title: '照片-04',
    },
  ]

  return (
    <Drawer
      title="订单 WK-D1919 选片结果"
      open={open}
      onClose={() => onClose && onClose()}
      size="large"
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
      <Divider style={{ margin: '0' }} />
      <div style={{ padding: '16px 24px' }}>
        <List
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<p>{item.title}</p>}
                description="这是一些备注"
              />
            </List.Item>
          )}
        />
      </div>
    </Drawer>
  )
}

export default PhotoReviewResult
