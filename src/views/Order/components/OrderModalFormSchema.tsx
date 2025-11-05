import type { FormSchema } from '@/components/BasicForm/types'
import { Button } from 'antd'
import { PlusIcon } from 'lucide-react'

interface Params {
  mode: 'create' | 'edit'
  onAddProducts?: () => void
  // 获取套餐列表函数
  getPackageList: (values: Record<string, any>) => Promise<any>
  // 获取单品列表函数
  getSingleProductList: (values: Record<string, any>) => Promise<any>
}

export interface OrderModalFormData {
  orderNumber: string
  customerName: string
  customerPhone: string
  maxSelectPhotos: number
  extraPhotoPrice: number
  validUntil: number
  products: Array<{
    productType: 'package' | 'single'
    packageId?: string
    singleProductId?: string
    count?: number
  }>
}

export function getOrderModalFormSchema(params: Params): FormSchema[] {
  const { mode, onAddProducts, getPackageList, getSingleProductList } = params

  return [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入订单号',
      },
      fieldName: 'orderNumber',
      label: '订单号',
      disabled: mode === 'edit',
      rules: [
        { required: true, message: '请输入订单号' },
      ],
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入客户姓名',
      },
      fieldName: 'customerName',
      label: '客户姓名',
      disabled: mode === 'edit',
      rules: [
        { required: true, message: '请输入客户姓名' },
      ],
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入客户电话',
      },
      fieldName: 'customerPhone',
      label: '客户电话',
      rules: [
        {
          required: true,
          message: '请输入客户手机',
        },
        () => ({
          validator(_, value) {
            if (!value || /^1[3-9]\d{9}$/.test(value)) {
              return Promise.resolve()
            }
            return Promise.reject(new Error('请输入正确的手机号码'))
          },
        }),
      ],
      disabled: mode === 'edit',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 1,
        addonAfter: '张',
      },
      fieldName: 'maxSelectPhotos',
      label: '可选精修数',
    },
    {
      component: 'InputNumber',
      componentProps: {
        min: 0,
        step: 50,
        addonBefore: '¥',
        addonAfter: '元/张',
      },
      fieldName: 'extraPhotoPrice',
      label: '加选单价',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '7天', value: 7 },
          { label: '15天', value: 15 },
          { label: '30天', value: 30 },
          { label: '60天', value: 60 },
        ],
      },
      fieldName: 'validUntil',
      label: '订单有效期',
    },
    {
      fieldName: 'products',
      label: '消费项目',
      children: [
        {
          component: 'Select',
          componentProps: {
            placeholder: '请选择产品类型',
            options: [
              {
                label: '套餐',
                value: 'package',
              },
              {
                label: '单品',
                value: 'single',
              },
            ],
            style: { width: 100 },
          },
          fieldName: 'productType',
          styles: { display: 'inline-block', width: 100 },
          noStyle: true,
        },
        {
          component: 'Select',
          componentProps: {
            placeholder: '请选择套餐',
            options: [],
            style: { width: 180 },
          },
          optionLoader: getPackageList,
          fieldName: 'packageId',
          dependencies: {
            if: (values) => {
              return values.productType === 'package'
            },
            triggerFields: ['productType'],
          },
          noStyle: true,
        },
        {
          component: 'Select',
          componentProps: {
            placeholder: '请选择单品',
            options: [],
            style: { width: 180 },
          },
          optionLoader: getSingleProductList,
          fieldName: 'singleProductId',
          dependencies: {
            if: (values) => {
              return values.productType === 'single'
            },
            triggerFields: ['productType'],
          },
          styles: { display: 'inline-block', width: 180 },
          noStyle: true,
        },
        {
          component: 'custom',
          fieldName: 'customX',
          render: () => <strong>x</strong>,
          dependencies: {
            if: (values) => {
              return values.productType === 'single'
            },
            triggerFields: ['productType'],
          },
        },
        {
          component: 'InputNumber',
          fieldName: 'count',
          componentProps: {
            min: 1,
            style: { width: 100 },
            placeholder: '数量',
          },
          dependencies: {
            if: (values) => {
              return values.productType === 'single'
            },
            triggerFields: ['productType'],
          },
          noStyle: true,
        },
        {
          component: 'custom',
          fieldName: 'addButton',
          render: () => (
            <Button
              type="primary"
              icon={<PlusIcon size={18} />}
              onClick={onAddProducts}
            >
              添加
            </Button>
          ),
        },
      ],
    },
  ]
}
