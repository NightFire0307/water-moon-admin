import type { InputNumberProps, InputProps, RadioGroupProps, SelectProps, SwitchProps } from 'antd'
import type { Rule } from 'antd/es/form'
import type { CSSProperties, ReactElement } from 'react'

// 表单组件属性映射
export interface ComponentPropsMap {
  Input: InputProps
  Select: SelectProps
  InputNumber: InputNumberProps
  RadioGroup: RadioGroupProps
  Switch: SwitchProps
}

// 操作按钮配置项
export interface ActionButtonOptions {
  disabled?: boolean
  loading?: boolean
  content?: string
  show?: boolean
}

// 定义联动依赖类型
export interface FormItemDependencies {
  if?: boolean | ((values: Record<string, any>) => boolean)
  show?: boolean | ((values: Record<string, any>) => boolean)
  disabled?: boolean | ((values: Record<string, any>) => boolean)
  required?: boolean | ((values: Record<string, any>) => boolean)
  triggerFields?: string[]
}

// 常规表单字段配置
export interface NormalFormSchemaMap<K extends keyof ComponentPropsMap = keyof ComponentPropsMap> {
  component: K
  componentProps?: ComponentPropsMap[K]
  fieldName: string
  label?: string
  required?: boolean
  rules?: Rule[]
  dependencies?: FormItemDependencies
  disabled?: boolean
  children?: undefined
  noStyle?: boolean // 是否不使用 Form.Item 包裹，默认为 false
  styles?: CSSProperties // 自定义样式
}

// 嵌套子字段配置
export interface GroupFormSchema {
  component?: undefined
  fieldName: string
  label?: string
  required?: boolean
  rules?: Rule[]
  dependencies?: FormItemDependencies
  disabled?: boolean
  children?: FormSchema[] // 支持嵌套子字段
  styles?: CSSProperties // 自定义样式
}

// 自定义字段配置
export interface CustomFormSchema {
  component: 'custom'
  fieldName: string
  render: () => ReactElement
  dependencies?: FormItemDependencies
}

// 表单字段配置项
export type FormSchema = NormalFormSchemaMap | GroupFormSchema | CustomFormSchema
