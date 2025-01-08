import type { ReactNode } from 'react'
import { Button, Col, Form, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { forwardRef, useImperativeHandle, useState } from 'react'

export interface Field {
  label: string
  name: string
  type: 'input' | 'inputNumber' | 'select' | 'switch'// 支持 input 和 select 类型
  addonAfter?: ReactNode // InputNumber 时需要传入后缀
  step?: number // InputNumber 每次改变步数，可以为小数
  placeholder?: string
  initialValue?: string
  options?: Array<any> // Select 时需要传入选项
  filedNames?: { label: string, value: string } // Select 时需要传入字段名
  optionRender?: (option: any) => ReactNode // Select 时需要传入渲染函数
  multiple?: boolean // Select 时需要传入是否多选
  children?: Field[]
}

interface ProductFormProps {
  fields: Field[]
  itemPerRow?: number // 每行展示的字段数
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

export const CustomForm = forwardRef<ProductFormRef, ProductFormProps>((props, ref) => {
  const { fields, layout = 'horizontal', submitButtonText = '提交', cancelButtonText = '重置', onSubmit, onReset, footer, itemPerRow = 1 } = props
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({})
  const [form] = useForm()
  const colSpan = 24 / itemPerRow // 计算每个 Col 的 span
  const totalRows = Math.ceil(fields.length / itemPerRow) // 计算出行数

  function handleSwitchChange(name: string, checked: boolean) {
    setVisibleFields(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  // 通过 useImperativeHandle 暴露给父组件调用
  useImperativeHandle(ref, () => ({
    resetForm: () => {
      form.resetFields()
    },
    setFormValues: (values) => {
      form.setFieldsValue(values)
    },
  }))

  // 递归渲染字段
  const renderFields = (fields: Field[]) => {
    return fields.map((field) => {
      if (field.type === 'switch') {
        return (
          <Col span={colSpan} key={field.name}>
            <Form.Item label={field.label} name={field.name} valuePropName="checked">
              <Switch onChange={checked => handleSwitchChange(field.name, checked)} />
            </Form.Item>
            {field.children && visibleFields[field.name] && (
              <Row gutter={[16, 16]}>
                {renderFields(field.children)}
                {' '}
                {/* 递归渲染子字段 */}
              </Row>
            )}
          </Col>
        )
      }
      else {
        return (
          <Col span={colSpan} key={field.name}>
            <Form.Item label={field.label} name={field.name}>
              {/* 渲染输入框 */}
              {field.type === 'input' && <Input placeholder={field.placeholder || ''} />}
              {/* 渲染数字输入框 */}
              {field.type === 'inputNumber' && (
                <InputNumber
                  placeholder={field.placeholder || ''}
                  addonAfter={field.addonAfter ?? null}
                  step={field.step ?? 1}
                />
              )}
              {/* 渲染选择框 */}
              {field.type === 'select' && field.options && (
                <Select
                  mode={field.multiple ? 'multiple' : 'tags'}
                  options={field.options}
                  fieldNames={field.filedNames}
                  placeholder={field.placeholder || ''}
                  optionRender={field.optionRender}
                  style={{ width: '200px' }}
                />
              )}
            </Form.Item>
          </Col>
        )
      }
    })
  }

  return (
    <Form form={form} layout={layout} onFinish={onSubmit}>
      {
        Array.from({ length: totalRows }).map((_, rowIndex) => {
          const startIndex = rowIndex * itemPerRow
          const endIndex = Math.min(startIndex + itemPerRow, fields.length)
          const rowFields = fields.slice(startIndex, endIndex)

          return (
            <Row gutter={[16, 16]} key={rowIndex}>
              {renderFields(rowFields)}
              {' '}
              {/* 渲染每一行的字段 */}
            </Row>
          )
        })
      }

      {/* 提交和重置按钮 */}
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
