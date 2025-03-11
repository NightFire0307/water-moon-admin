import type { DescriptionsProps } from 'antd'
import { getOrderDetailById } from '@/apis/order.ts'
import { formatDate } from '@/utils/formatDate.ts'
import { Descriptions, Modal, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface OrderDetailProps {
  orderId: number
  open: boolean
  onClose?: () => void
}

export function OrderDetail(props: OrderDetailProps) {
  const { orderId, open, onClose } = props
  const [items, setItems] = useState<DescriptionsProps['items']>([])

  async function fetchOrderDetail() {
    const { data } = await getOrderDetailById(orderId)

    setItems([
      { label: '订单号', children: data.order_number },
      { label: '客户', children: data.customer_name },
      { label: '客户手机', children: data.customer_phone },
      { label: '总照片数（张）', children: data.total_photos },
      { label: '可选数量（张）', children: data.max_select_photos },
      { label: '已选数量（张）', children: data.select_photos },
      { label: '加选单价', children: (
        <span>
          ￥
          {' '}
          {data.extra_photo_price}
        </span>
      ) },
      { label: '订单状态', children: (
        {
          0: <Tag color="blue">待选片</Tag>,
          1: <Tag color="gold">选片中</Tag>,
          2: <Tag color="orange">选片完成</Tag>,
          3: <Tag color="red">订单异常</Tag>,
          4: <Tag color="green">已完成</Tag>,
        }[data.status]
      ) },
      {
        label: '产品信息',
        children: data.order_products.map((product) => {
          return (
            <div key={product.product.id}>
              <p>
                {product.product.name}
                {' '}
                x
                {' '}
                {product.quantity}
              </p>
            </div>
          )
        }),
        span: 'filled',
      },
      {
        label: '链接信息',
        children: data.links.length > 0 ? <Tag color="green">已生成</Tag> : <Tag color="red">未生成</Tag>,
        span: 'filled',
      },
      { label: '创建时间', children: formatDate(data.created_at), span: 2 },
      { label: '更新时间', children: formatDate(data.updated_at), span: 2 },
    ])
  }

  useEffect(() => {
    if (open) {
      fetchOrderDetail()
    }
  }, [open, orderId])

  return (
    <Modal open={open} centered width={1000} footer={null} onCancel={onClose}>
      <Descriptions
        size="small"
        title="订单详情"
        items={items}
        column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        bordered
      />
    </Modal>
  )
}
