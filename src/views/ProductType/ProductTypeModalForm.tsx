import { Form, Input, message, Modal } from 'antd'
import { useEffect, useState } from 'react'

interface ProductTypeModalFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialData?: { id: number, name: string }
  onCreate: (values: { name: string }) => void
  onUpdate: (values: { id: number, name: string }) => void
  onClose: () => void
}

export function ProductTypeModalForm(props: ProductTypeModalFormProps) {
  const { mode, open, onClose, initialData, onCreate, onUpdate } = props
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = Form.useForm()

  async function handleSubmit() {
    setConfirmLoading(true)
    form.validateFields().catch(() => message.error('表单校验失败，请检查！'))

    if (mode === 'create') {
      onCreate({ name: form.getFieldValue('name') })
    }
    else if (mode === 'edit' && initialData) {
      onUpdate({ id: initialData.id, ...form.getFieldsValue() })
    }

    setConfirmLoading(false)
  }

  useEffect(() => {
    if (mode === 'edit') {
      form.setFieldsValue(initialData)
    }
  }, [initialData])

  return (
    <Modal
      title={mode === 'create' ? '新增产品类型' : '编辑产品类型'}
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields()
        onClose()
      }}
      confirmLoading={confirmLoading}
      centered
    >
      <Form form={form}>
        <Form.Item label="类型名称" name="name" rules={[{ required: true, message: '需要一个类型名称' }]}>
          <Input placeholder="请输入类型名称" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
