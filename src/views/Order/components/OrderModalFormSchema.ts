import type { FormSchema } from "@/components/BasicForm/types";

interface Params {
  mode: 'create' | 'edit';
}

export const getOrderModalFormSchema = (params: Params): FormSchema[] => {
  const { mode } = params;

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
        { required: true, message: '请输入订单号' }
      ]
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
        { required: true, message: '请输入客户姓名' }
      ]
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
      label: '加选单价'
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '7天', value: 7 },
          { label: '15天', value: 15 },
          { label: '30天', value: 30 },
        ]
      },
      fieldName: 'validUntil',
      label: '订单有效期',
    }
  ]
}