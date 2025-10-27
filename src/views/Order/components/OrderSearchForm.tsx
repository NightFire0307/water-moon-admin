import type { FormSchema } from '@/components/BasicForm/types'
import { Badge } from 'antd'
import { BasicForm } from '@/components/BasicForm'
import { PageCard } from '@/components/PageCard'

const orderSearchSchema: FormSchema[] = [
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
    },
    fieldName: 'orderNumber',
    label: '订单号',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入客户姓名',
    },
    fieldName: 'customerName',
    label: '客户姓名',
  },
  {
    component: 'Input',
    componentProps: {
      placeholder: '请输入客户手机号',
    },
    fieldName: 'customerPhone',
    label: '客户手机号',
  },
  {
    component: 'Select',
    componentProps: {
      placeholder: '请选择',
      options: [
        { label: '全部', value: 'all' },
        { label: '预选阶段', value: 'preSelected' },
        { label: '产品选择', value: 'productSelected' },
        { label: '提交选片', value: 'submitted' },
        { label: '已完成', value: 'finished' },
        { label: '已取消', value: 'canceled' },
      ],
      optionRender: option => (
        {
          all: (<Badge status="default" text="全部" />),
          preSelected: (<Badge status="processing" color="blue" text="预选阶段" />),
          productSelected: (<Badge status="processing" color="cyan" text="产品选择" />),
          submitted: (<Badge status="warning" color="orange" text="提交选片" />),
          finished: (<Badge status="success" color="green" text="已完成" />),
          canceled: (<Badge status="error" color="red" text="已取消" />),
        }[option.value!]
      ),
      style: { width: 180 },
    },
    fieldName: 'status',
    label: '订单状态',
  },
]

export function OrderSearchForm() {
  const onSubmit = (values: Record<string, any>) => {
    console.log(values)
  }

  return (
    <PageCard>
      <BasicForm
        schema={orderSearchSchema}
        layout="inline"
        initialValues={{
          status: 'all',
        }}
        submitButtonOptions={{
          content: '搜索',
        }}
        handleSubmit={onSubmit}
      />
    </PageCard>
  )
}
