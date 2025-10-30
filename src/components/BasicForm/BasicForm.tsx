import type { ActionButtonOptions, ComponentPropsMap, FormSchema } from './types'
import { Button, Form, type FormProps, Input, InputNumber, Radio, Select, Space, Switch } from 'antd'
import { type FC, useCallback, useEffect, useImperativeHandle, useState } from 'react'

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
  const [dynamicAttrs, setDynamicAttrs] = useState<Record<string, { disabled?: boolean, required?: boolean, if?: boolean, show?: boolean }>>({})

  useImperativeHandle(ref, () => ({
    validate: () => form.validateFields(),
    getValues: () => form.getFieldsValue(),
    resetFields: () => form.resetFields(),
  }))

  // 组件映射表
  const componentMap: Record<keyof ComponentPropsMap, FC<any>> = {
    Input,
    Select,
    InputNumber,
    RadioGroup: Radio.Group,
    Switch,
  }

  // 计算联动属性
  const computedDynamicAttrs = useCallback((allValues: Record<string, any>) => {
    const result: Record<string, { disabled?: boolean, required?: boolean, if?: boolean, show?: boolean }> = {}

    // 递归遍历 schema
    function traverseSchema(schemas: FormSchema[]) {
      schemas.forEach((item) => {
        if (item.dependencies) {
          result[item.fieldName] = {
            if: typeof item.dependencies.if === 'function' ? item.dependencies.if(allValues) : item.dependencies.if,
            show: typeof item.dependencies.show === 'function' ? item.dependencies.show(allValues) : item.dependencies.show,
            disabled: typeof item.dependencies.disabled === 'function' ? item.dependencies.disabled(allValues) : item.dependencies.disabled,
            required: typeof item.dependencies.required === 'function' ? item.dependencies.required(allValues) : item.dependencies.required,
          }
        }

        if (item.component !== 'custom' && item.children && item.children.length > 0) {
          traverseSchema(item.children)
        }
      })
    }

    traverseSchema(schema)
    setDynamicAttrs(result)
  }, [schema])

  // 在 schema 变化时重新计算联动逻辑
  const onFormValuesChange = (_: any, allValues: Record<string, any>) => {
    computedDynamicAttrs(allValues)
  }

  // 渲染表单组件
  const renderFormItem = useCallback((item: FormSchema) => {
    console.log('渲染表单组件')
    // 处理嵌套子字段
    if ('children' in item && item.children && item.children.length > 0) {
      return (
        <Form.Item key={item.fieldName} label={item.label} style={item.styles}>
          <Space>
            {item.children.map(child => renderFormItem(child))}
          </Space>
        </Form.Item>
      )
    }

    // 处理自定义字段渲染
    if (item.component === 'custom') {
      if (dynamicAttrs[item.fieldName]?.if === false) return null
      return item.render()
    }

    // 处理常规表单字段
    if ('component' in item && item.component) {
      if (dynamicAttrs[item.fieldName]?.if === false) {
        return null
      }

      const Comp = componentMap[item.component]
      if (!Comp)
        return null

      return (
        <Form.Item
          key={item.fieldName}
          label={item.label}
          name={item.fieldName}
          required={item.required ?? dynamicAttrs[item.fieldName]?.required}
          rules={item.rules}
          style={{
            ...item.styles,
            display: dynamicAttrs[item.fieldName]?.show === false ? 'none' : undefined,
          }}
          noStyle={item.noStyle}
        >
          <Comp
            {...item.componentProps}
            disabled={item.disabled ?? dynamicAttrs[item.fieldName]?.disabled}
          />
        </Form.Item>
      )
    }

    return null

  }, [schema, dynamicAttrs, componentMap])

  // 首次渲染时计算联动属性
  useEffect(() => {
    computedDynamicAttrs(form.getFieldsValue())
  }, [schema])

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onFinish={handleSubmit}
      onValuesChange={onFormValuesChange}
    >
      {
        schema.map(item => renderFormItem(item))
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
