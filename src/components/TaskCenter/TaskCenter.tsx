import type { UploadPhoto, UploadStatus } from '@/store/uploadStore'
import { Button, Divider, Drawer, message, Progress, Space, Table, type TableColumnsType, type TableProps, Tag, Typography, Upload, type UploadProps } from 'antd'
import { CloudUploadIcon } from 'lucide-react'
import { useOrderInfoContext } from '@/contexts/OrderInfoContext'
import { uploadStore } from '@/store/uploadStore'

const { Link } = Typography

export function TaskCenter() {
  const { orderNumber, id } = useOrderInfoContext()
  const { visible, createUploadOrder, addQueueOrder, removePhoto, closeTaskCenter } = uploadStore()
  const uploadPhotos = uploadStore(
    state => state.getUploadPhotosByOrderId(String(id)),
  )

  const columns: TableColumnsType<UploadPhoto> = [
    {
      title: '序号',
      dataIndex: 'uid',
      rowScope: 'row',
      render: (_, __, index) => (
        <strong>{index + 1}</strong>
      ),
      width: 70,
    },
    {
      title: '照片名称',
      dataIndex: 'name',
      render: (name: string) => name.split('.')[0],
    },
    {
      title: '上传进度',
      dataIndex: 'progress',
      render: (progress: number) => (
        <Progress
          percent={progress}
          percentPosition={{ align: 'center', type: 'inner' }}
          strokeColor={
            progress === 100 ? '#87d068' : { '0%': '#108ee9', '100%': '#87d068' }
          }
          showInfo={false}
        />
      ),
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: UploadStatus) => {
        switch (status) {
          case 'Pending':
            return <Tag color="default">待上传</Tag>
          case 'Uploading':
            return <Tag color="blue">上传中</Tag>
          case 'Done':
            return <Tag color="green">已完成</Tag>
          case 'Error':
            return <Tag color="red">上传失败</Tag>
          case 'Abort':
            return <Tag color="orange">已中止</Tag>
        }
      },
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {record.status === 'Pending' && <Link onClick={() => removePhoto(String(id), record.uid)}>取消</Link>}
          {record.status === 'Uploading' && <Link type="danger">中止</Link>}
          {record.status === 'Error' && <Link>重试</Link>}
          {record.status === 'Done' && (
            <Link type="danger">移除</Link>
          )}
        </Space>
      ),
    },
  ]

  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const isJPG = file.type === 'image/jpeg'
      if (!isJPG) {
        message.error(`${file.name} 不是 JPG 格式的文件`)
      }
      else {
        createUploadOrder(String(id), orderNumber, file)
      }

      return false
    },
  }

  return (
    <Drawer
      title="任务中心"
      open={visible}
      width="60%"
      onClose={closeTaskCenter}
    >
      <Space>
        <Button
          icon={<CloudUploadIcon size={16} />}
          onClick={() => addQueueOrder(String(id))}
        >
          开始上传
        </Button>

        <Upload {...uploadProps}>
          <Button type="primary" icon={<CloudUploadIcon size={16} />}>添加照片</Button>
        </Upload>
      </Space>

      <Divider />

      <Table
        rowKey="uid"
        pagination={false}
        dataSource={uploadPhotos ?? []}
        columns={columns}
        virtual
        scroll={{ y: 700 }}
      />
    </Drawer>
  )
}
