import type { TableColumnProps, UploadFile, UploadProps } from 'antd'
import { Button, Flex, Space, Table, Typography, Upload } from 'antd'
import { useState } from 'react'

const { Link } = Typography

interface UploadPhotoInfo {
  key: string
  file_name: string
  file_size: number
}

export function UploadPhoto() {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [dataSource, setDataSource] = useState<UploadPhotoInfo[]>([])

  const columns: TableColumnProps[] = [
    {
      title: '文件名',
      dataIndex: 'file_name',
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
      title: '操作',
      dataIndex: 'action',
      width: 100,
      render: (_, record) => {
        const item = record as UploadPhotoInfo
        return <Link onClick={() => handleRemove(item.key)}>移除</Link>
      },
    },
  ]

  const uploadProps: UploadProps = {
    fileList,
    multiple: true,
    beforeUpload: (file) => {
      setFileList([...fileList, file])

      setDataSource(prev => [...prev, {
        key: file.uid,
        file_name: file.name,
        file_size: Math.round(file.size / 1024 / 1024 * 100) / 100,
      }])
      return false
    },
    showUploadList: false,
  }

  function handleRemove(key: string) {
    setFileList(fileList.filter(file => file.uid !== key))
    setDataSource(dataSource.filter(item => item.key !== key))
  }

  // 清空所有文件
  function handleAllClear() {
    setFileList([])
    setDataSource([])
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Space>
          <Upload {...uploadProps}>
            <Button>选择文件</Button>
          </Upload>
          <Button disabled={dataSource.length === 0} onClick={handleAllClear}>清空文件</Button>
        </Space>
        <Button type="primary" disabled={dataSource.length === 0}>开始上传</Button>
      </Flex>

      <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ y: 55 * 5 }} />
    </Space>
  )
}
