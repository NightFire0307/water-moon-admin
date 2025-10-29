import type { TableProps } from 'antd/lib'
import type { UploadStatus } from '../../../store/useUploadStore'
import { Badge, Button, Drawer, Progress, Space, Table } from 'antd'
import { useMemo } from 'react'
import { useOrderStore } from '@/store/useOrderStore'
import { type UploadPhoto, useUploadStore } from '@/store/useUploadStore'

export function OrderTaskDrawer() {
  const { orderInfo } = useOrderStore()
  const { visible, getUploadPhotosByOrderId, orderQueues, startOrderQueue } = useUploadStore()

  const dataSource = useMemo(() => {
    if (!orderInfo)
      return []
    return getUploadPhotosByOrderId(orderInfo.id.toString())
  }, [orderInfo, orderQueues])

  const columns: TableProps<UploadPhoto>['columns'] = [
    {
      title: '序号',
      dataIndex: 'index',
      render: (_: any, __: UploadPhoto, index: number) => index + 1,
      width: 60,
    },
    {
      title: '文件名',
      dataIndex: 'name',
      render: (name: string) => (
        <span>{name.split('.')[0]}</span>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" showInfo={false} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: UploadStatus) => (
        {
          Pending: (<Badge status="default" text="等待上传" />),
          Uploading: (<Badge status="processing" text="上传中" />),
          Done: (<Badge status="success" text="上传成功" />),
          Error: (<Badge status="error" text="上传失败" />),
          Abort: (<Badge status="warning" text="已取消" />),
        }[status]
      ),
    },

    {
      title: '操作',
      dataIndex: 'action',
      render: () => (
        <Space>
          <a>删除</a>
          <a>取消</a>
          <a>重试</a>
        </Space>
      ),
    },
  ]

  return (
    <Drawer
      title="上传任务中心"
      open={visible}
      width="60%"
      extra={(
        <Button onClick={() => {
          console.log('111')
          startOrderQueue(orderInfo?.id.toString())
        }}
        >
          开始上传
        </Button>
      )}
    >
      <Table
        rowKey="uid"
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        virtual
        scroll={{ y: 55 * 15 }}
      />
    </Drawer>
  )
}
