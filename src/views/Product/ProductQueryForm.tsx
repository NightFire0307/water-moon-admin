import { Button, Form, Input, Select, Space } from 'antd'
import { useForm } from 'antd/es/form/Form'

interface IProductQueryFormProps {
  onQuery: (values: { name?: string, productType?: number }) => void
  onReset: () => void
}

export function ProductQueryForm(props: IProductQueryFormProps) {
  const { onQuery, onReset } = props

  const [form] = useForm()

  function handleQuery() {
    const { name, productType }: { name?: string, productType?: number } = form.getFieldsValue()
    if (!name && !productType)
      return

    onQuery({ name, productType })
  }

  function handleReset() {
    form.resetFields()
    onReset()
  }

  return (
    <Form form={form} layout="inline">
      <Form.Item label="产品名称" name="name">
        <Input placeholder="请输入产品名称" />
      </Form.Item>
      <Form.Item label="产品类型" name="productType" style={{ width: '250px' }}>
        <Select placeholder="请选择产品类型" fieldNames={{ label: 'name', value: 'id' }} />
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
