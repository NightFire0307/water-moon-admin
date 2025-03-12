import type { IProductType } from '@/types/product'
import { createProduct, getProductTypes } from '@/apis/product'
import { Col, Form, Input, InputNumber, message, Modal, Row, Select, Switch } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'

interface ProductModalFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialData?: { id: number, name: string, productTypeId: number }
  onClose: () => void
}

export function ProductModalForm(props: ProductModalFormProps) {
  const { mode, open, onClose, initialData } = props
  const [productTypes, setProductTypes] = useState<IProductType[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = useForm()

  async function handleOk() {
    setConfirmLoading(true)
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (mode === 'create') {
        const { msg } = await createProduct(values)
        message.success(msg)
      }
      else {
        // updateProduct
      }
    }
    catch {
      message.error('请检查表单')
    }
    finally {
      setConfirmLoading(false)
      handleCancel()
    }
  }

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  async function fetchProductTypes() {
    const { data } = await getProductTypes({ current: 1, pageSize: 100 })
    setProductTypes(data.list)
  }

  useEffect(() => {
    if (open) {
      fetchProductTypes()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }

    if (open && mode === 'edit') {
      form.setFieldsValue(initialData)
    }
  }, [open, mode, initialData])

  return (
    <Modal
      title={mode === 'create' ? '新增产品' : '编辑产品'}
      open={open}
      okText={mode === 'create' ? '新增' : '更新'}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ isPublished: true, photoLimit: 0, ...initialData }}
        className="product-form"
      >
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="产品名称"
              rules={[{ required: true, message: '请输入产品名称' }]}
            >
              <Input placeholder="请输入产品名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productTypeId"
              label="产品类型"
              rules={[{ required: true, message: '请选择产品类型' }]}
            >
              <Select
                options={productTypes}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder="请选择产品类型"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[24, 16]}>
          <Col span={12}>
            <Form.Item
              name="photoLimit"
              label="照片数量限制"
              extra="0 表示不限制"
              rules={[{ required: true, message: '请输入照片数量限制' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="请输入数量限制"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isPublished"
              label="是否上架"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
