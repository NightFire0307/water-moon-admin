import type { ProductQueryParams } from '@/apis/product.ts'
import type { IProduct, IProductType } from '@/types/product.ts'
import type { TableColumnsType } from 'antd'
import { createProduct, deleteProduct, getProductById, getProductList, getProductTypes, updateProduct } from '@/apis/product.ts'
import { ProductModalForm } from '@/views/Product/ProductModalForm.tsx'
import { ProductQueryForm } from '@/views/Product/ProductQueryForm.tsx'
import { Button, Divider, Flex, message, Popconfirm, Space, Table } from 'antd'

import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export function Product() {
  const [dataSource, setDataSource] = useState<IProduct[]>([])
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [options, setOptions] = useState<IProductType[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [initialData, setInitialData] = useState<{ id: number, name: string, productTypeId: number }>()

  async function fetchProductList(params: ProductQueryParams) {
    const { data } = await getProductList(params)
    setDataSource(data.list)
  }

  async function fetchProductTypes() {
    const { data } = await getProductTypes()
    setOptions(data.list)
  }

  async function handleEdit(id: number) {
    const { data } = await getProductById(id)
    setInitialData({
      id: data.id,
      name: data.name,
      productTypeId: data.type.id,
    })

    setMode('edit')
    setModalOpen(true)
  }

  async function handleCreate(values: { name: string, productType: number }) {
    try {
      await createProduct(values)
      message.success('创建成功')
    }
    catch (err) {
      const e = err as Error
      message.error(e.message)
    }
    finally {
      setModalOpen(false)
      fetchProductList({})
    }
  }

  async function handleUpdate(id: number, values: { name: string, productType: number }) {
    const { code } = await updateProduct(id, values)
    if (code === 200) {
      message.success('修改成功')
      setModalOpen(false)
      fetchProductList({})
    }
  }

  async function handleDelete(id: number) {
    await deleteProduct(id)
    message.success('删除成功')
    fetchProductList({})
  }

  async function handleQuery(values: { name?: string, productType?: number }) {
    try {
      const { data } = await getProductList(values)
      setDataSource(data.list)
    }
    catch {
      message.error('查询失败')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProductList({})
        await fetchProductTypes()
      }
      catch {
        message.error('加载数据失败')
      }
    }
    loadData()
  }, [])

  const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')

  const columns: TableColumnsType<IProduct> = [
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
      render: (value: IProduct) => {
        return (
          <Space>
            <Button type="link" onClick={() => handleEdit(value.id)}>编辑</Button>
            <Popconfirm
              title="是否确认删除？"
              onConfirm={() => handleDelete(value.id)}
              onCancel={() => message.info('操作取消')}
            >
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <ProductQueryForm
        productTypeOptions={options}
        onQuery={handleQuery}
        onReset={() => fetchProductList({})}
      />
      <Divider />
      <Flex>
        <Button
          type="primary"
          onClick={() => {
            setMode('create')
            setModalOpen(true)
          }}
        >
          新增
        </Button>
      </Flex>
      <Table rowKey="id" dataSource={dataSource} columns={columns} style={{ marginTop: '24px' }} />
      <ProductModalForm
        mode={mode}
        open={modalOpen}
        initialData={initialData}
        productTypeOptions={options}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
