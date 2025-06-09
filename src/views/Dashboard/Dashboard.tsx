import type { IOrderSummary } from '@/types/order'
import { getOrderSummary } from '@/apis/order'
import { Card, DatePicker, Flex } from 'antd'
import { CalendarClock, CheckCircle, Hourglass, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AreaChart } from './components/AreaChart'
import { ColumnChart } from './components/ColumnChart'
import { DashboardCard } from './components/DashboardCard'
import styles from './Dashboard.module.less'

const { RangePicker } = DatePicker

export function Dashboard() {
  const [orderSummary, setOrderSummary] = useState<IOrderSummary>({
    todayOrderCount: 0,
    inProgressOrderCount: 0,
    completedOrderCount: 0,
    totalOrderCount: 0,
  })

  const data = [
    {
      title: '今日订单',
      icon: <CalendarClock />,
      value: orderSummary.todayOrderCount,
      growth: 23,
    },
    {
      title: '正在进行中订单',
      icon: <Hourglass />,
      value: orderSummary.inProgressOrderCount,
      growth: -23,
      color: 'green',
    },
    {
      title: '已完成订单',
      icon: <CheckCircle />,
      value: orderSummary.completedOrderCount,
      growth: -5,
      color: 'gold',
    },
    {
      title: '总订单数',
      icon: <Package />,
      value: orderSummary.totalOrderCount,
      growth: 23,
      color: 'magenta',
    },
  ]

  const fetchOrderSummary = async () => {
    const { data } = await getOrderSummary()
    setOrderSummary({ ...data })
  }

  useEffect(() => {
    fetchOrderSummary()
  }, [])

  return (
    <div className={styles['dashboard-content']}>
      <DashboardCard data={data} />

      <Card
        title="一周选片趋势"
        hoverable
        style={{ marginTop: 24 }}
        extra={<RangePicker />}
      >
        <AreaChart />
      </Card>

      <Flex style={{ marginTop: '24px', width: '100%' }} gap={24}>
        <Card hoverable style={{ width: '100%' }}>
          <ColumnChart />
        </Card>
      </Flex>
    </div>
  )
}
