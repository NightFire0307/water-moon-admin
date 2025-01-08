import { CustomForm } from '@/components/CustomForm.tsx'
import { OrderStatus } from '@/types/order.ts'
import { Badge } from 'antd'

interface IOrderQueryFormProps {
  onQuery: (values: { order_number?: string, customer_name?: string, customer_phone?: string, status?: OrderStatus }) => void
  onReset: () => void
}

export function OrderQueryForm(props: IOrderQueryFormProps) {
  const { onQuery, onReset } = props

  const options = [
    { label: <Badge status="default" text="选片未开始" />, value: OrderStatus.NOT_STARTED },
    { label: <Badge status="processing" text="选片进行中" />, value: OrderStatus.IN_PROGRESS },
    { label: <Badge status="success" text="选片已完成" />, value: OrderStatus.SUBMITTED },
    { label: <Badge status="error" text="链接已过期" />, value: OrderStatus.EXPIRED },
  ]

  return (
    <CustomForm
      layout="inline"
      fields={[
        { label: '订单号', name: 'order_number', type: 'input' },
        { label: '客户姓名', name: 'customer_name', type: 'input' },
        { label: '客户手机', name: 'customer_phone', type: 'input' },
        {
          label: '订单状态',
          name: 'status',
          type: 'select',
          placeholder: '请选择',
          options,
        },
      ]}
      onSubmit={onQuery}
      onReset={onReset}
    />
  )
}
