import type { ActionButtonOptions, FormSchema } from './types'
import { Button, Form, type FormProps, Input, InputNumber, Radio, Select, Space } from 'antd'
import { useImperativeHandle } from 'react'

export interface BasicFormRef {
  validate: () => Promise<void>
  getValues: () => Record<string, any>
  resetFields: () => void
}

export interface BasicFormProps {
  schema: FormSchema[]
  initialValues?: object
  layout?: FormProps['layout']
  handleSubmit?: (values: Record<string, any>) => void
  resetButtonOptions?: ActionButtonOptions
  submitButtonOptions?: ActionButtonOptions
  showDefaultButtons?: boolean // 是否显示默认的重置和提交按钮，默认为 true
  ref?: React.Ref<BasicFormRef>
}

export function BasicForm(props: BasicFormProps) {
  const {
    schema,
    layout = 'horizontal',
    initialValues,
    handleSubmit,
    resetButtonOptions,
    submitButtonOptions,
    showDefaultButtons = true,
    ref,
  } = props
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => ({
    validate: () => form.validateFields(),
    getValues: () => form.getFieldsValue(),
    resetFields: () => form.resetFields(),
  }))

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      {
        schema.map(item => (
          <Form.Item
            key={item.fieldName}
            label={item.label}
            name={item.fieldName}
            required={item.required}
            rules={item.rules}
          >
            {
              item.component === 'Input' && (
                <Input {...item.componentProps} disabled={item.disabled} />
              )
            }
            {
              item.component === 'Select' && (
                <Select {...item.componentProps} disabled={item.disabled} />
              )
            }
            {
              item.component === 'InputNumber' && (
                <InputNumber {...item.componentProps} disabled={item.disabled} />
              )
            }
            {
              item.component === 'RadioGroup' && (
                <Radio.Group {...item.componentProps} disabled={item.disabled} />
              )
            }
          </Form.Item>
        ))
      }

      {/* 操作按钮部分 */}
      {
        showDefaultButtons && (
          <Space>
            {
              resetButtonOptions?.show !== false && (
                <Button
                  disabled={resetButtonOptions?.disabled}
                  loading={resetButtonOptions?.loading}
                  onClick={() => form.resetFields()}
                >
                  { resetButtonOptions?.content || '重置' }
                </Button>
              )
            }
            {
              submitButtonOptions?.show !== false && (
                <Button
                  type="primary"
                  disabled={submitButtonOptions?.disabled}
                  loading={submitButtonOptions?.loading}
                  htmlType="submit"
                >
                  { submitButtonOptions?.content || '提交' }
                </Button>
              )
            }
          </Space>
        )
      }
    </Form>
  )
}
