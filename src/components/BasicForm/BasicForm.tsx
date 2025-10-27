import type { ActionButtonOptions, FormSchema } from './types'
import { Button, Form, type FormProps, Input, Select, Space } from 'antd'

export interface BasicFormProps {
  schema: FormSchema[]
  initialValues?: object
  layout?: FormProps['layout']
  handleSubmit?: (values: Record<string, any>) => void
  resetButtonOptions?: ActionButtonOptions
  submitButtonOptions?: ActionButtonOptions
}

export function BasicForm(props: BasicFormProps) {
  const {
    schema,
    layout = 'horizontal',
    initialValues,
    handleSubmit,
    resetButtonOptions,
    submitButtonOptions,
  } = props
  const [form] = Form.useForm()

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
          >
            {
              item.component === 'Input' && (
                <Input {...item.componentProps} />
              )
            }
            {
              item.component === 'Select' && (
                <Select {...item.componentProps} />
              )
            }
          </Form.Item>
        ))
      }

      {/* 操作按钮部分 */}
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
    </Form>
  )
}
