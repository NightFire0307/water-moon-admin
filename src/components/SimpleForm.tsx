import type { FormInstance } from 'antd/lib'
import type { FC, ReactNode } from 'react'
import { Form, Input, InputNumber, Select, Switch } from 'antd'

export interface BaseField {
  name: string
  extra?: string
  label?: string
  rules?: any[]
  placeholder?: string
  valuePropName?: string
  required?: boolean
}

type InputField = BaseField & {
  type: 'input'
}

type InputNumberField = BaseField & {
  type: 'inputNumber'
}

type SelectField = BaseField & {
  type: 'select'
  options: { label: string, value: any }[]
}

type SwitchField = BaseField & {
  type: 'switch'
  checkedChildren?: ReactNode
  unCheckedChildren?: ReactNode
}

export type FieldSchema = InputField | SelectField | SwitchField | InputNumberField

interface SimpleFormProps {
  fields: FieldSchema[]
  initialValues?: object
  form?: FormInstance
  layout?: 'horizontal' | 'vertical' | 'inline'
}

const SimpleForm: FC<SimpleFormProps> = ({ fields, form, layout, initialValues }) => {
  const renderField = (field: FieldSchema) => {
    const commonProps = {
      placeholder: field.placeholder ?? '',
    }

    switch (field.type) {
      case 'input':
        return <Input {...commonProps} />
      case 'inputNumber':
        return <InputNumber {...commonProps} />
      case 'select':
        return <Select {...commonProps} options={field.options} />
      case 'switch':
        return <Switch checkedChildren={field.checkedChildren} unCheckedChildren={field.unCheckedChildren} />
      default:
        return null
    }
  }

  return (
    <Form form={form} layout={layout} initialValues={initialValues}>
      {
        fields.map((field) => {
          const commonProps = {
            name: field.name,
            label: field.label,
            extra: field.extra ?? '',
            required: field.required ?? false,
            rules: field.rules ?? [],
            valuePropName: field.valuePropName ?? 'value',
          }

          return (
            <Form.Item {...commonProps}>
              {
                renderField(field)
              }
            </Form.Item>
          )
        })
      }
    </Form>
  )
}

export default SimpleForm
