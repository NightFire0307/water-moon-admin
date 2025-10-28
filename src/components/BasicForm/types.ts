import type { InputNumberProps, InputProps, RadioGroupProps, SelectProps } from 'antd'
import type { Rule } from 'antd/es/form'

// 表单组件属性映射
export interface ComponentPropsMap {
  Input: InputProps
  Select: SelectProps
  InputNumber: InputNumberProps
  RadioGroup: RadioGroupProps
}

// 操作按钮配置项
export interface ActionButtonOptions {
  disabled?: boolean
  loading?: boolean
  content?: string
  show?: boolean
}

// 表单字段配置项
export type FormSchema = FormSchemaMap[keyof FormSchemaMap]

// 定义联动依赖类型
export type FormItemDependencies = {
  show?: boolean
  triggerFields?: string[]
}

// 表单字段配置项映射
export type FormSchemaMap = {
  [K in keyof ComponentPropsMap]: {
    component: K
    componentProps?: ComponentPropsMap[K]
    fieldName: string
    label: string
    required?: boolean
    rules?: Rule[]
    dependencies?: FormItemDependencies
    disabled?: boolean
  }
}
