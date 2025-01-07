import type { ReactNode } from 'react'
import { Button, Form, Input, Select, Space } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { forwardRef, useImperativeHandle } from 'react'

export interface Field {
  label: string
  name: string
  type: 'input' | 'select' // 支持 input 和 select 类型
  placeholder?: string
  initialValue?: string
  options?: Array<any> // Select 时需要传入选项
  filedNames?: { label: string, value: string } // Select 时需要传入字段名
}

interface ProductFormProps {
  fields: Field[]
  layout?: 'vertical' | 'horizontal' | 'inline'
  submitButtonText?: string // 提交按钮文案
  cancelButtonText?: string // 取消按钮文案
  onSubmit?: (values: any) => void
  onReset?: () => void
  footer?: ReactNode
}

export interface ProductFormRef {
  resetForm: () => void
  setFormValues: (values: any) => void
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>((props, ref) => {
  const { fields, layout = 'horizontal', submitButtonText = '提交', cancelButtonText = '取消', onSubmit, onReset, footer } = props
  const [form] = useForm()

  // 通过 useImperativeHandle 暴露给父组件调用
  useImperativeHandle(ref, () => ({
    resetForm: () => {
      form.resetFields()
    },
    setFormValues: (values) => {
      form.setFieldsValue(values)
    },
  }))

  return (
    <Form form={form} layout={layout} onFinish={onSubmit}>
      {
        fields.map(field => (
          <Form.Item label={field.label} name={field.name} key={field.name}>
            {
              field.type === 'input'
                ? (
                    <Input placeholder={field.placeholder || ''} />
                  )
                : field.type === 'select' && field.options
                  ? (
                      <Select options={field.options} fieldNames={field.filedNames} placeholder={field.placeholder || ''} />
                    )
                  : null
            }
          </Form.Item>
        ))
      }
      <Form.Item>
        {
          footer || (
            <Space>
              <Button type="primary" htmlType="submit">{submitButtonText}</Button>
              <Button onClick={() => {
                form.resetFields()
                onReset && onReset()
              }}
              >
                {cancelButtonText}
              </Button>
            </Space>
          )
        }
      </Form.Item>
    </Form>
  )
})
