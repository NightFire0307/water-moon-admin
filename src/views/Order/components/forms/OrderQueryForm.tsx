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
    { label: <Badge status="default" text="选片未开始" />, value: OrderStatus.NOT_STARTED.toString() },
    { label: <Badge status="processing" text="选片进行中" />, value: OrderStatus.IN_PROGRESS.toString() },
    { label: <Badge status="success" text="选片已完成" />, value: OrderStatus.SUBMITTED.toString() },
    { label: <Badge status="error" text="订单已取消" />, value: OrderStatus.CANCEL.toString() },
  ]

  useEffect(() => {
    console.log(onQuery, onReset)
  }, [])

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
