import type { TableColumnProps } from 'antd'
import { Button, Drawer, Space, Table } from 'antd'

interface TaskCenterProps {
  open: boolean
  onClose: () => void
}

export function TaskCenter(props: TaskCenterProps) {
  const { open, onClose } = props

  const columns: TableColumnProps[] = [
    {
      title: '文件名',
      dataIndex: 'file_name',
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
    },
    {
      title: '状态',
      dataIndex: 'status',
    },
    {
      title: '操作',
      dataIndex: 'action',
    },
  ]

  return (
    <Drawer title="任务中心" open={open} onClose={onClose} width="50%">
      <p>刷新页面或离开当前页面会终止所有任务并清空任务记录</p>
      <Space>
        <Button>全部停止</Button>
        <Button>全部重试</Button>
        <Button>清空记录</Button>
      </Space>
      <Table columns={columns} />
    </Drawer>
  )
}
