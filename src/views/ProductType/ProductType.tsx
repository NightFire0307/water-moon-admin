import type { IProductType } from '@/types/product.ts'
import type { TableColumnsType } from 'antd'
import {
  createProductType,
  deleteProductType,
  getProductTypes,
  queryProductByName,
} from '@/apis/product.ts'
import { formatDate } from '@/utils/formatDate.ts'
import { ProductTypeModalForm } from '@/views/ProductType/ProductTypeModalForm.tsx'
import { Button, Divider, Form, Input, message, Popconfirm, Space, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'

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
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [modalVisible, setModalVisible] = useState(false)
  const [initialData, setInitialData] = useState<{ id: number, name: string }>({})

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
      render: formatDate,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: formatDate,
    },
    {
      title: '操作',
      render: (value: IProductType) => {
        return (
          <Space size="large">
            <a onClick={() => {
              setMode('edit')
              setModalVisible(true)
            }}
            >
              编辑
            </a>
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

  async function handleCreate(value) {
    const { msg } = await createProductType(value)
    message.success(msg)
  }

  function handleUpdate() {}

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
      <Button
        type="primary"
        onClick={() => {
          setMode('create')
          setModalVisible(true)
        }}
      >
        新增
      </Button>
      <Table rowKey="id" columns={columns} dataSource={dataSource} style={{ marginTop: '24px' }} />
      <ProductTypeModalForm
        mode={mode}
        open={modalVisible}
        initialData={initialData}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => setModalVisible(false)}
      />
    </>
  )
}
