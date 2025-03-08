import type { IProductType } from '@/types/product.ts'
import type { TableColumnsType } from 'antd'
import {
  batchDeleteProductType,
  createProductType,
  deleteProductType,
  getProductTypeById,
  getProductTypes,
  queryProductByName,
  updateProductType,
} from '@/apis/product.ts'
import usePagination from '@/hooks/usePagination.ts'
import useTableSelection from '@/hooks/useTableSelection.ts'
import { formatDate } from '@/utils/formatDate.ts'
import { ProductTypeModalForm } from '@/views/ProductType/ProductTypeModalForm.tsx'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
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
    const name = form.getFieldValue('name')
    onQuery(name || '')
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
  const [initialData, setInitialData] = useState<{ id: number, name: string } | undefined>(undefined)
  const { rowSelection, selectedRows } = useTableSelection({ type: 'checkbox' })
  const { pagination, setTotal, current, pageSize, reset } = usePagination()

  const columns: TableColumnsType<IProductType> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '产品类型名称',
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
            <Button
              onClick={async () => {
                setMode('edit')
                setModalVisible(true)
                const { data } = await getProductTypeById(value.id)
                setInitialData(data)
              }}
              type="link"
              icon={<EditOutlined />}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDelete(value.id)}
              onCancel={() => {
                message.info('取消删除')
              }}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  async function handleQuery(name: string) {
    const { data } = await queryProductByName(name)
    setDataSource(data.list)
    setTotal(data.total)
  }

  async function handleCreate(value: { name: string }) {
    const { msg } = await createProductType(value)
    message.success(msg)
    fetchProductTypes()
  }

  async function handleUpdate(id: number, data: { name: string }) {
    const { msg } = await updateProductType(id, data)
    message.success(msg)
    fetchProductTypes()
  }

  async function handleDelete(id: number) {
    const { msg } = await deleteProductType(id)
    message.success(msg)
    await fetchProductTypes()
  }

  async function fetchProductTypes(current = pagination.current, pageSize = pagination.pageSize) {
    try {
      const { data } = await getProductTypes({ current, pageSize })
      setDataSource(data.list)
      setTotal(data.total)
    }
    catch {
      message.error('获取产品类型失败')
    }
  }

  async function handleBatchDelete() {
    const ids = selectedRows.map(item => item.id)
    const { msg } = await batchDeleteProductType({ ids })
    message.success(msg)
    fetchProductTypes()
  }

  useEffect(() => {
    fetchProductTypes(current, pageSize)
  }, [current, pageSize])

  return (
    <>
      <ProductQueryForm
        onQuery={handleQuery}
        onReset={() => {
          fetchProductTypes(1, pagination.pageSize)
          reset()
        }}
      />
      <Divider />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            setMode('create')
            setModalVisible(true)
          }}
        >
          新增
        </Button>
        <Popconfirm title="确定删除吗？" onConfirm={handleBatchDelete} onCancel={() => message.info('取消删除')}>
          <Button type="primary" danger disabled={selectedRows.length === 0}>
            批量删除
          </Button>
        </Popconfirm>
      </Space>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        pagination={pagination}
        style={{ marginTop: '24px' }}
      />
      <ProductTypeModalForm
        mode={mode}
        open={modalVisible}
        initialData={initialData}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => {
          setModalVisible(false)
          setInitialData(undefined)
        }}
      />
    </>
  )
}
