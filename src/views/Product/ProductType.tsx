import type { TableColumnsType } from 'antd'
import { Button, Divider, Form, Input, message, Modal, Space, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
import { createProductType, getProductTypes } from '../../apis/product.ts'

interface IProductType {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

function ProductQueryForm() {
  return (
    <Form layout="inline">
      <Form.Item label="类型名称">
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export function ProductType() {
  const [dataSource, setDataSource] = useState<IProductType[]>([])
  const [modalTitle, setModalTitle] = useState<string>('默认标题')
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false)
  const [form] = useForm()

  const columns: TableColumnsType<IProductType> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '产品名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
    },
    {
      title: '操作',
      render: () => {
        return (
          <Space size="large">
            <a>编辑</a>
            <a style={{ color: '#f5222d' }}>删除</a>
          </Space>
        )
      },
    },
  ]

  async function handleOk() {
    setConfirmLoading(true)
    const values: { name: string } = form.getFieldsValue()
    const { code, msg } = await createProductType(values)

    if (code === 409) {
      message.warning(msg)
    }
    else {
      message.success('创建成功')
      setModalVisible(false)
    }
    setConfirmLoading(false)
  }

  function handleCancel() {
    setModalVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    getProductTypes().then(({ data }) => {
      setDataSource(data.list)
    })
  }, [])

  return (
    <>
      <ProductQueryForm />
      <Divider />
      <Button type="primary" onClick={() => setModalVisible(true)}>新增</Button>
      <Table rowKey="id" columns={columns} dataSource={dataSource} style={{ marginTop: '24px' }} />
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        centered
      >
        <Form form={form}>
          <Form.Item label="类型名称" name="name" rules={[{ required: true, message: '需要一个类型名称' }]}>
            <Input placeholder="请输入类型名称" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
