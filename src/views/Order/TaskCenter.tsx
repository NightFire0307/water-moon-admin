import type { QueueTask } from '@/store/useUploadFile'
import type { TableColumnProps } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import { UploadStatus } from '@/store/useUploadFile'
import { useUploadFile } from '@/store/useUploadFile.tsx'
import { Button, Drawer, Flex, Space, Table, Tag } from 'antd'

interface TaskCenterProps {
  open: boolean
  onClose: () => void
}

function renderStatus(value: UploadStatus, record: AnyObject) {
  const { progress } = record as QueueTask
  switch (value) {
    case UploadStatus.Uploading:
      return (
        <span>
          {Math.round(progress * 100)}
          %
        </span>
      )
    case UploadStatus.Done:
      return <Tag color="green">已完成</Tag>
    case UploadStatus.Pending:
      return <Tag>待上传</Tag>
    case UploadStatus.Error:
      return <Tag color="red">上传失败</Tag>
    case UploadStatus.Abort:
      return <Tag color="red">已终止</Tag>
    default:
      return <span>{value}</span>
  }
}

export function TaskCenter(props: TaskCenterProps) {
  const { open, onClose } = props
  const { uploadQueue, cancelUploadTask, removeUploadTask, cancelAllUploadTask, clearUploadQueue } = useUploadFile()

  const columns: TableColumnProps[] = [
    {
      title: '文件名',
      dataIndex: 'file_name',
    },
    {
      title: '所属订单号',
      dataIndex: 'order_number',
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      render: value => (
        <span>
          {value}
          {' '}
          MB
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: renderStatus,
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, item) => {
        const task = item as QueueTask
        return (
          <Space>
            {task.status === UploadStatus.Uploading && <a onClick={() => cancelUploadTask(task.uid)}>停止</a>}
            {task.status === UploadStatus.Error && <a>重试</a>}
            {task.status === UploadStatus.Done && <a onClick={() => removeUploadTask(task.uid)}>移除</a>}
          </Space>
        )
      },
    },
  ]

  return (
    <Drawer title="任务中心" open={open} onClose={onClose} width="50%" zIndex={1001}>
      <Flex gap={16} vertical>
        <p style={{ backgroundColor: '#efefef', padding: '8px 16px' }}>
          刷新页面或离开当前页面会终止所有任务并清空任务记录
        </p>
        <Space>
          <Button onClick={cancelAllUploadTask} disabled={uploadQueue.length === 0}>全部停止</Button>
          <Button disabled>全部重试</Button>
          <Button onClick={clearUploadQueue} disabled={uploadQueue.length === 0}>清空记录</Button>
        </Space>
        <Table rowKey="uid" columns={columns} dataSource={uploadQueue} />
      </Flex>
    </Drawer>
  )
}
