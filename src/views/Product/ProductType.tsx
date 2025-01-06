import type { TableColumnsType } from 'antd'
import type { IProductType } from '../../types/product.ts'
import { Button, Divider, Form, Input, message, Modal, Popconfirm, Space, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { createProductType, deleteProductType, getProductTypes, queryProductByName } from '../../apis/product.ts'

interface IProductQueryForm {
  onQuery: (name: string) => void
  onReset: () => void
}

function ProductQueryForm(props: IProductQueryForm) {
  const [form] = useForm()
  const { onQuery, onReset } = props

  function handleQuery() {
    const values = form.getFieldValue('name')
    if (!values)
      return
    onQuery(values)
  }

  return (
    <Form layout="inline" form={form}>
      <Form.Item label="类型名称" name="name">
        <Input />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleQuery}>查询</Button>
          <Button onClick={() => {
            form.resetFields()
            onReset()
          }}
          >
            重置
          </Button>
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
      render: ({ createdAt }: IProductType) => {
        return dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: ({ updatedAt }: IProductType) => {
        return dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      title: '操作',
      render: (value: IProductType) => {
        return (
          <Space size="large">
            <a onClick={() => handleEdit(value.name)}>编辑</a>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDelete(value.id)}
              onCancel={() => {
                message.info('取消删除')
              }}
            >
              <a style={{ color: '#f5222d' }}>删除</a>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  async function handleQuery(name: string) {
    const { data } = await queryProductByName(name)

    setDataSource(data.list)
  }

  async function handleOk() {
    try {
      setConfirmLoading(true)
      const values: { name: string } = form.getFieldsValue()
      const { code, msg } = await createProductType(values)

      if (code === 409) {
        message.warning(msg)
      }
      else {
        message.success(msg)
        setModalVisible(false)
        await fetchProductTypes()
      }
    }
    catch {
      message.error('操作失败')
    }
    finally {
      setConfirmLoading(false)
      form.resetFields()
    }
  }

  async function handleDelete(id: number) {
    try {
      const { msg } = await deleteProductType(id)
      message.success(msg)
      await fetchProductTypes()
    }
    catch {
      message.error('删除失败')
    }
  }

  function handleEdit(name: string) {
    form.setFieldValue('name', name)
    setModalTitle('编辑')
    setModalVisible(true)
  }

  async function fetchProductTypes() {
    try {
      const { data } = await getProductTypes()
      setDataSource(data.list)
    }
    catch {
      message.error('获取产品类型失败')
    }
  }

  useEffect(() => {
    fetchProductTypes()
  }, [])

  return (
    <>
      <ProductQueryForm onQuery={handleQuery} onReset={fetchProductTypes} />
      <Divider />
      <Button type="primary" onClick={() => setModalVisible(true)}>新增</Button>
      <Table rowKey="id" columns={columns} dataSource={dataSource} style={{ marginTop: '24px' }} />
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => {
          setModalVisible(false)
        }}
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
