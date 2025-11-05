import type { ActionButtonOptions, ComponentPropsMap, FormSchema } from './types'
import { Button, Form, type FormProps, Input, InputNumber, Radio, Select, Space, Switch } from 'antd'
import { debounce } from 'lodash-es'
import { type FC, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface BasicFormRef<T = any> {
  validate: () => Promise<void>
  getFieldValue: (name: string) => any
  getFieldsValue: () => T
  resetFields: () => void
}

export interface BasicFormProps<T = any> {
  schema: FormSchema[]
  initialValues?: object
  layout?: FormProps['layout']
  handleSubmit?: (values: Record<string, any>) => void
  resetButtonOptions?: ActionButtonOptions
  submitButtonOptions?: ActionButtonOptions
  showDefaultButtons?: boolean // 是否显示默认的重置和提交按钮，默认为 true
  ref?: React.Ref<BasicFormRef<T>>
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
  const [optionsMap, setOptionsMap] = useState<Record<string, Array<{ label: string, value: any }>>>({}) // 存储动态加载的选项
  const loadingRef = useRef<Record<string, boolean>>({}) // 用于追踪选项动态加载状态

  useImperativeHandle(ref, () => ({
    validate: () => form.validateFields(),
    getFieldValue: (name: string) => form.getFieldValue(name),
    getFieldsValue: () => form.getFieldsValue(),
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

  // 动态加载选项
  const loadOptions = useCallback(async (item: FormSchema, allValues: any) => {
    if (item.component === 'Select' && item.optionLoader) {
      loadingRef.current[item.fieldName] = true
      try {
        const options = await item.optionLoader(allValues)
        setOptionsMap(prev => ({
          ...prev,
          [item.fieldName]: options,
        }))
      }
      catch (err) {
        console.error('加载选项失败:', err)
      }
      finally {
        loadingRef.current[item.fieldName] = false
      }
    }
  }, [])

  /**
   * 递归遍历 schema，加载需要动态加载选项的 Select 组件
   * @param schemas 表单字段配置数组
   * @param allValues 当前表单所有值
   * @param isInitial 是否为初始加载
   */
  const traverseAndLoad = useCallback(
    (schemas: FormSchema[], allValues: Record<string, any>, isInitial: boolean = false, changeValues?: Record<string, any>) => {
      schemas.forEach((item) => {
        if (item.component === 'Select' && item.optionLoader) {
          if (isInitial || (changeValues && item.dependencies?.triggerFields?.some(field => field in changeValues))) {
            console.log('加载选项 for', item.fieldName)
            loadOptions(item, allValues)
          }
        }
        if (item.component !== 'custom' && item.children && item.children.length > 0) {
          traverseAndLoad(item.children, allValues, isInitial, changeValues)
        }
      })
    },
    [loadOptions],
  )

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
  const debounceOnFormValuesChange = debounce(useCallback((changeValues: Record<string, any>, allValues: Record<string, any>) => {
    computedDynamicAttrs(allValues)
    traverseAndLoad(schema, allValues, false, changeValues)
  }, [schema, computedDynamicAttrs, traverseAndLoad]), 300)

  // 渲染表单组件
  const renderFormItem = useCallback((item: FormSchema) => {
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
      if (dynamicAttrs[item.fieldName]?.if === false)
        return null
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

      // 动态加载选项
      const options = item.component === 'Select' && optionsMap[item.fieldName] ? optionsMap[item.fieldName] : item.componentProps?.options

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
            options={options}
            disabled={item.disabled ?? dynamicAttrs[item.fieldName]?.disabled}
            loading={loadingRef.current[item.fieldName]}
          />
        </Form.Item>
      )
    }

    return null
  }, [optionsMap, dynamicAttrs, componentMap])

  // 首次渲染时计算联动属性
  useEffect(() => {
    const allValues = form.getFieldsValue()
    computedDynamicAttrs(allValues)
    traverseAndLoad(schema, allValues, true)
  }, [schema])

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onFinish={handleSubmit}
      onValuesChange={debounceOnFormValuesChange}
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
