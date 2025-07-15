import type { IOrderSummary } from '@/types/order'
import { getOrderSummary, getWeeklyOrderStats } from '@/apis/order'
import { Card, DatePicker } from 'antd'
import { CalendarClock, CheckCircle, Hourglass, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AreaChart } from './components/AreaChart'
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
  const [weekOrderCounts, setWeekOrderCounts] = useState<number[]>([])

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

  const fetchLastWeekOrderCounts = async () => {
    const { data } = await getWeeklyOrderStats()
    setWeekOrderCounts(data.lastWeekOrderCounts)
  }

  useEffect(() => {
    fetchOrderSummary()
    fetchLastWeekOrderCounts()
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
        <AreaChart lastWeekOrderCounts={weekOrderCounts} />
      </Card>
    </div>
  )
}
