import type { GetProp, TableColumnProps, UploadProps } from 'antd'
import type { FileData } from 'qiniu-js'
import { getOssToken } from '@/apis/auth.ts'
import { UploadStatus, useUploadFile } from '@/store/useUploadFile.tsx'
import { Button, Flex, notification, Space, Table, Typography, Upload } from 'antd'

import { createDirectUploadTask } from 'qiniu-js'
import { useRef, useState } from 'react'

const { Link } = Typography

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

interface UploadPhotoInfo {
  key: string
  file_name: string
  file_size: number
}

export function UploadPhoto() {
  const [dataSource, setDataSource] = useState<UploadPhotoInfo[]>([])
  const [fileList, setFileList] = useState<FileType[]>([])
  const uploadToken = useRef<string>('')
  const { setUploadFile, setUploadFileStatus, setUploadFileProgress } = useUploadFile()

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
      setFileList(prev => [...prev, file])

      setDataSource(prev => [...prev, {
        key: file.uid,
        file_name: file.name,
        file_size: Math.round(file.size / 1024 / 1024 * 100) / 100,
      }])
      return false
    },
    showUploadList: false,
  }

  function handleUpload() {
    setDataSource([])
    notification.open({
      type: 'info',
      message: '开始上传',
      description: '进度请查看任务中心',
    })

    fileList.forEach((file) => {
      // 重命名文件
      const newFileName = new File([file as FileType], `D1555/${file.name}`, { type: file.type })
      const fileData: FileData = { type: 'file', data: newFileName }
      const uploadTask = createDirectUploadTask(
        fileData,
        { tokenProvider: fetchOssUploadToken },
      )
      // 添加到上传文件列表
      setUploadFile(file)

      // 上传进度
      uploadTask.onProgress((progress) => {
        setUploadFileProgress(file.uid, progress.percent)
      })

      // 上传完成
      uploadTask.onComplete((result, context) => {
        console.log('上传完成:', result, context)
        setUploadFileStatus(file.uid, UploadStatus.Done)
      })

      // 上传失败
      uploadTask.onError((error, context) => {
        console.log('上传失败:', error, context)
        setUploadFileStatus(file.uid, UploadStatus.Error)
      })

      // 开始上传
      uploadTask.start()
    })
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

  // 获取上传凭证
  async function fetchOssUploadToken() {
    if (uploadToken.current)
      return uploadToken.current
    const { data } = await getOssToken()
    uploadToken.current = data.uploadToken
    return uploadToken.current
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
        <Button type="primary" disabled={dataSource.length === 0} onClick={handleUpload}>开始上传</Button>
      </Flex>

      <Table columns={columns} dataSource={dataSource} pagination={false} scroll={{ y: 55 * 5 }} />
    </Space>
  )
}
