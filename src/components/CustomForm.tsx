import type { CheckboxOptionType } from 'antd'
import type { CSSProperties, ReactNode } from 'react'
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select, Space, Switch } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

interface CountConfig {
  // 最大字符数，不同于原生 `maxLength`，超出后标红但不会截断
  max?: number
  // 自定义字符计数，例如标准 emoji 长度大于 1，可以自定义计数策略将其改为 1
  strategy?: (value: string) => number
  // 同 `showCount`
  show?: boolean | ((args: { value: string, count: number, maxLength?: number }) => ReactNode)
  // 当字符数超出 `count.max` 时的自定义裁剪逻辑，不配置时不进行裁剪
  exceedFormatter?: (value: string, config: { max: number }) => string
}

// InputNumberField 用于 InputNumber 类型的字段
interface InputNumberField {
  addonAfter?: ReactNode // InputNumber 时需要传入后缀
  step?: number // InputNumber 每次改变步数，可以为小数
  min?: number // InputNumber 最小值
  max?: number // InputNumber 最大值
  count?: CountConfig
}

// SelectField 用于 Select 类型的字段
interface SelectField {
  options?: Array<any> // Select 时需要传入选项
  fieldNames?: { label: string, value: string } // Select 时需要传入字段名
  mode?: 'multiple' | 'tags' // Select 时需要传入是否多选
}

// RadioField 用于 Radio 类型的字段
interface RadioField {
  radioOptions?: string[] | number[] | Array<CheckboxOptionType>
  whenShow?: {
    name: string
    value: any
  }
}

export interface Field extends InputNumberField, SelectField, RadioField {
  label?: string
  name: string
  type: 'input' | 'inputNumber' | 'select' | 'switch' | 'radio' | 'radioGroup' | 'group'
  placeholder?: string
  initialValue?: string
  children?: Field[]
  fieldCols?: number
  noStyle?: boolean
}

interface ProductFormProps {
  fields: Field[]
  initialValues?: object
  fieldCols?: number // 字段列数
  layout?: 'vertical' | 'horizontal' | 'inline'
  submitButtonText?: string // 提交按钮文案
  cancelButtonText?: string // 取消按钮文案
  onSubmit?: (values: any) => void
  onReset?: () => void
  footer?: ReactNode
  styles?: CSSProperties
}

export interface ProductFormRef {
  resetForm: () => void
  setFormValues: (values: any) => void
}

export const CustomForm = forwardRef<ProductFormRef, ProductFormProps>((props, ref) => {
  const {
    fields,
    initialValues,
    layout = 'horizontal',
    submitButtonText = '提交',
    cancelButtonText = '重置',
    onSubmit,
    onReset,
    footer,
    fieldCols = 1,
    styles,
  } = props
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({})
  const [form] = useForm()
  const colSpan = 24 / fieldCols // 计算每个 Col 的 span
  const totalRows = Math.ceil(fields.length / fieldCols) // 计算出行数
  const whenShowMap = useRef<{ [key: string]: any }>()

  // 建立whenShow字段的映射
  function buildWhenShowMap(fields: Field[]) {
    const map: { [key: string]: any } = {}
    fields.forEach((field) => {
      if (field.whenShow) {
        map[field.whenShow.name] = field.whenShow.value
      }
      if (field.children) {
        Object.assign(map, buildWhenShowMap(field.children))
      }
    })
    return map
  }

  useEffect(() => {
    whenShowMap.current = buildWhenShowMap(fields)
  }, [fields])

  function handleSwitchChange(name: string, checked: boolean) {
    setVisibleFields(prev => ({
      ...prev,
      [name]: checked,
    }))
  }

  // 处理 radio 选项变化，控制字段显示
  function handleRadioChange(name: string, value: any) {
    setVisibleFields(prev => ({
      ...prev,
      [name]: whenShowMap.current ? whenShowMap.current[name] === value : false,
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
          <Col span={field.fieldCols ? (24 / field.fieldCols) : colSpan} key={field.name}>
            <Form.Item label={field.label} name={field.name} valuePropName="checked">
              <Switch onChange={checked => handleSwitchChange(field.name, checked)} />
            </Form.Item>
            {field.children && visibleFields[field.name] && (
              <Row gutter={16}>
                {renderFields(field.children)}
                {' '}
                {/* 递归渲染子字段 */}
              </Row>
            )}
          </Col>
        )
      }
      else if (field.type === 'radioGroup' && field.radioOptions) {
        return (
          <Col span={field.fieldCols ? (24 / field.fieldCols) : colSpan} key={field.name}>
            <Form.Item label={field.label} name={field.name}>
              <Radio.Group options={field.radioOptions} onChange={e => handleRadioChange(field.name, e.target.value)} />
            </Form.Item>
            {field.children && visibleFields[field.name] && (
              <Row gutter={16}>
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
          <Col span={field.fieldCols ? (24 / field.fieldCols) : colSpan} key={field.name}>
            <Form.Item label={field.label} name={field.name} noStyle={field.noStyle}>
              {/* 渲染输入框 */}
              {field.type === 'input' && <Input placeholder={field.placeholder || ''} count={field.count} />}
              {/* 渲染数字输入框 */}
              {field.type === 'inputNumber' && (
                <InputNumber
                  placeholder={field.placeholder || ''}
                  addonAfter={field.addonAfter ?? null}
                  step={field.step ?? 1}
                  min={field.min ?? 0}
                  max={field.max}
                />
              )}
              {/* 渲染选择框 */}
              {field.type === 'select' && field.options && (
                <Select
                  mode={field.mode}
                  options={field.options}
                  placeholder={field.placeholder || ''}
                  style={{ width: '200px' }}
                />
              )}
              {/* 渲染group */}
              {
                field.type === 'group' && field.children && (
                  <Row gutter={16}>
                    {renderFields(field.children)}
                  </Row>
                )
              }
            </Form.Item>
          </Col>
        )
      }
    })
  }

  return (
    <Form form={form} layout={layout} initialValues={initialValues} onFinish={onSubmit} style={styles}>
      {
        Array.from({ length: totalRows }).map((_, rowIndex) => {
          const startIndex = rowIndex * fieldCols
          const endIndex = Math.min(startIndex + fieldCols, fields.length)
          const rowFields = fields.slice(startIndex, endIndex)

          return (
            <Row gutter={[16, 16]} key={`row-${rowIndex}`}>
              {renderFields(rowFields)}
              {' '}
              {/* 渲染每一行的字段 */}
            </Row>
          )
        })
      }

      {/* 提交和重置按钮 */}
      {
        footer === null
          ? null
          : (
              <Form.Item>
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
              </Form.Item>
            )
      }
    </Form>
  )
})
