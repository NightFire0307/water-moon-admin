import type { TableColumnsType } from 'antd'
import { Button, Divider, Flex, Form, Input, Select, Space, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { getProductList } from '../../apis/product.ts'

interface Product {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

function ProductQueryForm() {
  const [form] = useForm()

  const handleQuery = () => {
    const values = form.getFieldsValue()
    console.log(values)
  }

  const handleReset = () => {
    form.resetFields()
  }

  return (
    <Form form={form} layout="inline">
      <Form.Item label="产品名称" name="name">
        <Input placeholder="请输入产品名称" />
      </Form.Item>
      <Form.Item label="产品类型" name="productType" style={{ width: '250px' }}>
        <Select placeholder="请选择产品类型"></Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleQuery}>查询</Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}

export function ProductList() {
  const [dataSource, setDataSource] = useState<Product[]>([])
  useEffect(() => {
    getProductList().then(({ data }) => {
      setDataSource(data.list)
    })
  }, [])

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
