import type { IOrder } from '@/types/order.ts'
import type { TableColumnProps } from 'antd'
import { getOrderList } from '@/apis/order.ts'
import { OrderStatus } from '@/types/order.ts'
import { OrderQueryForm } from '@/views/Order/OrderQueryForm.tsx'
import { PlusOutlined, RedoOutlined } from '@ant-design/icons'

import { Badge, Button, Divider, Flex, Space, Table, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

export function Order() {
  const [dataSource, setDataSource] = useState<IOrder[]>([])

  const columns: TableColumnProps[] = [
    {
      title: '订单号',
      dataIndex: 'order_number',
      render: value => <span style={{ fontWeight: '500' }}>{value}</span>,
    },
    { title: '客户', dataIndex: 'customer_name' },
    { title: '客户手机', dataIndex: 'customer_phone' },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (value) => {
        let status: 'success' | 'processing' | 'default' | 'error' | 'warning' = 'default'
        let text = ''
        switch (value) {
          case OrderStatus.NOT_STARTED:
            status = 'default'
            text = '选片未开始'
            break
          case OrderStatus.IN_PROGRESS:
            status = 'processing'
            text = '选片进行中'
            break
          case OrderStatus.SUBMITTED:
            status = 'success'
            text = '选片已完成'
            break
          case OrderStatus.EXPIRED:
            status = 'error'
            text = '链接已过期'
            break
          default:
            status = 'warning'
            text = '未知'
        }
        return <Badge status={status} text={text} />
      },
    },
    {
      title: '可选（张数）',
      dataIndex: 'max_select_photos',
      render: value => <span style={{ color: '#52c41a' }}>{value}</span>,
    },
    {
      title: '总共（张数）',
      dataIndex: 'total_photos',
      render: value => <span style={{ color: '#faad14' }}>{value}</span>,
    },
    { title: '操作', dataIndex: 'action', render: () => (
      <Space>
        <a>查看</a>
        <a>重置</a>
        <a>编辑</a>
        <a>删除</a>
      </Space>
    ) },
  ]

  function handleQuery(values: any) {
    console.log(values)
  }

  async function fetchOrderList() {
    const { data } = await getOrderList()
    setDataSource(data.list)
  }

  useEffect(() => {
    fetchOrderList()
  }, [])

  return (
    <>
      <OrderQueryForm onQuery={handleQuery} onReset={() => fetchOrderList()} />
      <Divider />
      <Flex justify="flex-end" gap={4}>
        <Button icon={<PlusOutlined />} type="primary">新 建</Button>
        <Tooltip title="刷新">
          <Button icon={<RedoOutlined rotate={-90} />} type="text" />
        </Tooltip>
      </Flex>
      <Table rowKey="id" dataSource={dataSource} columns={columns} style={{ marginTop: '14px' }} bordered />
    </>
  )
}
