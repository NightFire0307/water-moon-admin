import type { IProduct } from '@/types/product.ts'
import type { MenuProps, TableColumnsType } from 'antd'
import type { ChangeEvent } from 'react'
import { deleteProduct, getProductById, getProductList, getProductTypes } from '@/apis/product.ts'
import usePagination from '@/hooks/usePagination.ts'
import useTableSelection from '@/hooks/useTableSelection.ts'
import { formatDate } from '@/utils/formatDate.ts'
import { ProductModalForm } from '@/views/Product/ProductModalForm.tsx'
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Form, Input, message, Select, Space, Table, Tag } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'

enum DropdownKeys {
  EDIT = 'edit',
  DELETE = 'delete',
}

export function Product() {
  const [dataSource, setDataSource] = useState<IProduct[]>([])
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [options, setOptions] = useState<{ label: string, value: number }[]>([{ label: '所有类型', value: 0 }])
  const [modalOpen, setModalOpen] = useState(false)
  const [initialData, setInitialData] = useState<{ id: number, name: string, productTypeId: number }>()
  const { pagination, setTotal, current, pageSize } = usePagination()
  const { rowSelection, selectedRows } = useTableSelection({ type: 'checkbox' })
  const [form] = useForm()

  const dropDownItems: MenuProps['items'] = [
    {
      key: DropdownKeys.EDIT,
      icon: <EditOutlined />,
      label: '编辑',
    },
    {
      type: 'divider',
    },
    {
      key: DropdownKeys.DELETE,
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ]

  async function fetchProductList(current = pagination.current, pageSize = pagination.pageSize) {
    const { data } = await getProductList({ current, pageSize })
    setDataSource(data.list)
    setTotal(data.total)
  }

  async function fetchProductTypes() {
    const { data } = await getProductTypes({ current, pageSize })
    setOptions((prev) => {
      return [
        ...prev,
        ...data.list.map(item => ({
          label: item.name,
          value: item.id,
        })),
      ]
    })
  }

  async function handleDropDownClick(key: DropdownKeys, id: number) {
    switch (key) {
      case DropdownKeys.EDIT:
        {
          const { data } = await getProductById(id)
          setInitialData({
            id: data.id,
            name: data.name,
            productTypeId: data.product_type.id,
          })

          setMode('edit')
          setModalOpen(true)
        }
        break
      case DropdownKeys.DELETE:
        await deleteProduct(id)
        message.success('删除成功')
        break
      default:
        break
    }

    fetchProductList()
  }

  async function handleQuery(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value) {
      const { data } = await getProductList({ name: value })
      setDataSource(data.list)
      setTotal(data.total)
    }
    else {
      fetchProductList()
    }
  }

  useEffect(() => {
    fetchProductList(current, pageSize)
    fetchProductTypes()
  }, [current, pageSize])

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
      title: '产品类型',
      dataIndex: 'type',
      render: (value: string) => {
        return <Tag color="blue">{value}</Tag>
      },
    },
    {
      title: '照片数量限制',
      dataIndex: 'photoLimit',
      render: (value: number) => {
        return <span>{ value === 0 ? '无限制' : value}</span>
      },
    },
    {
      title: '是否上架',
      dataIndex: 'isPublished',
      render: (value: boolean) => {
        return value ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: formatDate,
    },
    {
      title: '操作',
      render: (value: IProduct) => {
        return (
          <Dropdown
            menu={{
              items: dropDownItems,
              onClick: ({ key }) => handleDropDownClick(key as DropdownKeys, value.id),
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />}></Button>
          </Dropdown>
        )
      },
    },
  ]

  return (
    <>
      <Flex justify="space-between">
        <Form form={form} layout="inline">
          <Form.Item name="name">
            <Input prefix={<SearchOutlined />} placeholder="请输入产品名称" onChange={handleQuery} />
          </Form.Item>
          <Button
            type="primary"
            onClick={() => {
              setMode('create')
              setModalOpen(true)
            }}
            icon={<PlusOutlined />}
          >
            新产品
          </Button>
        </Form>
        <Space>
          {
            selectedRows.length > 0 && (
              <Button icon={<DeleteOutlined />} danger>
                删除
                <div>
                  {selectedRows.length}
                </div>
              </Button>
            )
          }
          <Select defaultValue={0} options={options} placeholder="产品类型" style={{ width: '150px' }}></Select>
        </Space>
      </Flex>

      <Table
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        rowSelection={rowSelection}
        style={{ marginTop: '24px' }}
      />
      <ProductModalForm
        mode={mode}
        open={modalOpen}
        initialData={initialData}
        onClose={() => {
          setModalOpen(false)
          fetchProductList(current, pageSize)
        }}
      />
    </>
  )
}
