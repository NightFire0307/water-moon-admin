import type { CreateOrderData, ProductsInfo } from '@/types/order.ts'
import type { IProduct } from '@/types/product.ts'
import { getProductList } from '@/apis/product.ts'
import { SelectProductCard } from '@/views/Order/SelectProductCard.tsx'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Col, Form, Input, InputNumber, Row, Select, Space } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'

interface CreateOrderProps {
  submitData: CreateOrderData
}

export interface CreateOrderRef {
  getValues: () => Promise<CreateOrderData>
  resetValues: () => void
}

export const OrderForm = forwardRef<CreateOrderRef, CreateOrderProps>((props, ref) => {
  const { submitData } = props
  const [singleProducts, setSingleProducts] = useState<ProductsInfo[]>([])
  const [productOptions, setProductOptions] = useState<IProduct[]>([])
  const [singleDisabled, setSingleDisabled] = useState(true)
  const [disabled, _] = useState(false)
  const [form] = useForm()

  useImperativeHandle(ref, () => ({
    getValues: async () => {
      try {
        await form.validateFields()
        const values = form.getFieldsValue(['order_number', 'customer_name', 'customer_phone', 'max_select_photos', 'extra_photo_price'])
        return {
          ...values,
          order_products: singleProducts,
        } as CreateOrderData
      }
      catch {
        return Promise.reject(new Error('请填写完整信息'))
      }
    },
    resetValues: () => {
      form.resetFields()
      setSingleProducts([])
    },
  }))

  useEffect(() => {
    if (submitData.order_products) {
      setSingleProducts(submitData.order_products)
    }
  }, [submitData])

  const handleAddSingleCount = useCallback((id: number, count: number) => {
    const product = singleProducts.find(product => product.id === id)
    if (product) {
      product.count += count
      setSingleProducts([...singleProducts])
    }
  }, [singleProducts])

  const handleMinusSingleCount = useCallback((id: number, count: number) => {
    const product = singleProducts.find(product => product.id === id)
    if (product && product.count > 1) {
      product.count -= count
      setSingleProducts([...singleProducts])
    }
  }, [singleProducts])

  // 添加单品
  const handleAddSingle = useCallback(() => {
    const productId = form.getFieldValue('single_product')
    const count = form.getFieldValue('count')
    const product = productOptions.find(product => product.id === productId)
    if (product) {
      setSingleProducts([...singleProducts, {
        id: productId,
        name: product.name,
        count,
      }])
    }
  }, [form, productOptions, singleProducts])

  // 移除单品
  function handleRemoveSingle(id: number) {
    const index = singleProducts.findIndex(product => product.id === id)
    if (index !== -1) {
      singleProducts.splice(index, 1)
      setSingleProducts([...singleProducts])
    }
  }

  useEffect(() => {
    // 获取单品列表
    getProductList({}).then((res) => {
      setProductOptions(res.data.list)
    })
  }, [])

  return (
    <>
      <Form form={form} initialValues={{ count: 1, ...submitData }}>
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
              <Input placeholder="请输入订单号" disabled={disabled} />
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
              <Input placeholder="请输入客户姓名" disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
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
              <Input placeholder="请输入客户手机" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="可选"
              name="max_select_photos"
              rules={[{
                required: true,
                message: '请输入可选张数',
              }]}
            >
              <InputNumber min={1} addonAfter="张" placeholder="请输入可选张数" disabled={disabled} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="超选单价" name="extra_photo_price">
              <InputNumber min={0} addonAfter="元 / 张" step={100} disabled={disabled} />
            </Form.Item>
          </Col>
        </Row>

        <Space>
          <Form.Item label="套餐选择">
            <Select style={{ width: '200px' }} placeholder="请选择套餐" disabled={disabled} />
          </Form.Item>
          <Form.Item>
            <Button icon={<PlusOutlined />} disabled>添加套餐</Button>
          </Form.Item>
        </Space>

        <Space>
          <Form.Item label="单品选择" name="single_product">
            <Select
              style={{ width: '200px' }}
              options={productOptions}
              fieldNames={{ label: 'name', value: 'id' }}
              placeholder="请选择单品"
              onChange={(value) => {
                if (value) {
                  setSingleDisabled(false)
                }
              }}
              disabled={disabled}
            />
          </Form.Item>
          <Form.Item name="count">
            <InputNumber placeholder="输入数量" disabled={disabled} />
          </Form.Item>
          <Form.Item>
            <Button icon={<PlusOutlined />} disabled={singleDisabled} onClick={handleAddSingle}>添加单品</Button>
          </Form.Item>
        </Space>
      </Form>

      <SelectProductCard
        seriesProducts={[]}
        singleProducts={singleProducts}
        onAddSingleCount={handleAddSingleCount}
        onMinusSingleCount={handleMinusSingleCount}
        onRemoveSeries={() => { }}
        onRemoveSingle={handleRemoveSingle}
      />
    </>
  )
})
