import type { TableColumnsType } from 'antd'
import { Button, Divider, Flex, Form, Input, Select, Space, Table } from 'antd'
import dayjs from 'dayjs'

interface Product {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

function ProductQueryForm() {
  return (
    <Form layout="inline">
      <Form.Item label="产品名称">
        <Input />
      </Form.Item>
      <Form.Item label="产品类型" style={{ width: '250px' }}>
        <Select placeholder="请选择产品类型"></Select>
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

export function ProductList() {
  const dataSource: Product[] = [
    {
      id: 3,
      name: '水晶相册',
      createdAt: '2024-12-19T04:48:27.429Z',
      updatedAt: '2024-12-20T06:25:15.768Z',
    },
    {
      id: 4,
      name: '陌上花开',
      createdAt: '2024-12-19T04:48:48.875Z',
      updatedAt: '2024-12-20T06:25:18.687Z',
    },
  ]

  const columns: TableColumnsType<Product> = [
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
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      render: () => {
        return (
          <Space>
            <Button type="link">编辑</Button>
            <Button type="link" danger>删除</Button>
          </Space>
        )
      },
    },
  ]

  return (
    <>
      <ProductQueryForm />
      <Divider />
      <Flex>
        <Button type="primary">新增</Button>
      </Flex>
      <Table rowKey="id" dataSource={dataSource} columns={columns} style={{ marginTop: '24px' }} />
    </>
  )
}
