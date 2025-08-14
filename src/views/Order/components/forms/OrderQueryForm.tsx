import SimpleForm from '@/components/SimpleForm'
import { OrderStatus } from '@/types/order.ts'
import { Badge } from 'antd'
import { useEffect } from 'react'

interface IOrderQueryFormProps {
  onQuery: (values: { order_number?: string, customer_name?: string, customer_phone?: string, status?: OrderStatus }) => void
  onReset: () => void
}

export function OrderQueryForm(props: IOrderQueryFormProps) {
  const { onQuery, onReset } = props

  const options = [
    { label: <Badge status="default" text="选片未开始" />, value: OrderStatus.PENDING.toString() },
    { label: <Badge status="processing" text="预选阶段" />, value: OrderStatus.PRE_SELECT.toString() },
    { label: <Badge status="success" text="选片已完成" />, value: OrderStatus.SUBMITTED.toString() },
    { label: <Badge status="error" text="订单已取消" />, value: OrderStatus.CANCEL.toString() },
  ]

  return (
    <SimpleForm
      layout="inline"
      fields={[
        {
          type: 'select',
          name: 'status',
          placeholder: '请选择订单状态',
          options,
        },
      ]}
    />
  )
}
