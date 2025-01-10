import { SelectProductCard } from '@/components/SelectProductCard.tsx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd'
import { useState } from 'react'

export function CreateOrder() {
  const [seriesProducts, setSeriesProducts] = useState<{ id: number, name: string, count: number }[]>([{
    id: 1,
    name: '套系1',
    count: 1,
  }, {
    id: 2,
    name: '套系2',
    count: 2,
  }])

  const [singleProducts, setSingleProducts] = useState<{ id: number, name: string, count: number }[]>([
    {
      id: 3,
      name: '单品1',
      count: 1,
    },
    {
      id: 4,
      name: '单品2',
      count: 2,
    },
  ])

  function handleAddSingleCount(id: number, count: number) {
    const product = singleProducts.find(product => product.id === id)
    if (product) {
      product.count += count
      setSingleProducts([...singleProducts])
    }
  }

  function handleMinusSingleCount(id: number, count: number) {
    const product = singleProducts.find(product => product.id === id)
    if (product && product.count > 1) {
      product.count -= count
      setSingleProducts([...singleProducts])
    }
  }

  return (
    <>
      <Form>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="订单号"
              name="order_number"
              rules={[{
                required: true,
                message: '请输入订单号',
              }]}
            >
              <Input placeholder="请输入订单号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="客户姓名"
              name="customer_name"
              rules={[{
                required: true,
                message: '请输入客户姓名',
              }]}
            >
              <Input placeholder="请输入客户姓名"></Input>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="客户手机"
          name="customer_phone"
          rules={[
            {
              required: true,
              message: '请输入客户手机',
            },
            () => ({
              validator(_, value) {
                if (!value || /^1[3-9]\d{9}$/.test(value)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('请输入正确的手机号码'))
              },
            }),
          ]}
        >
          <Input placeholder="请输入客户手机"></Input>
        </Form.Item>
        <Form.Item
          label="可选"
          name="max_select_photos"
          rules={[{
            required: true,
            message: '请输入可选张数',
          }]}
        >
          <InputNumber addonAfter="张" />
        </Form.Item>

        <Space>
          <Form.Item label="套餐选择">
            <Select style={{ width: '200px' }}></Select>
          </Form.Item>
          <Form.Item>
            <Button icon={<PlusOutlined />} disabled>添加套系</Button>
          </Form.Item>
        </Space>

        <Space>
          <Form.Item label="单品选择">
            <Select style={{ width: '200px' }}></Select>
          </Form.Item>
          <Form.Item name="count">
            <InputNumber placeholder="输入数量" />
          </Form.Item>
          <Form.Item>
            <Button icon={<PlusOutlined />} disabled>添加单品</Button>
          </Form.Item>
        </Space>
      </Form>

      <SelectProductCard
        seriesProducts={seriesProducts}
        singleProducts={singleProducts}
        onAddSingleCount={handleAddSingleCount}
        onMinusSingleCount={handleMinusSingleCount}
        onRemoveSeries={() => { }}
        onRemoveSingle={() => { }}
      />
    </>
  )
}
