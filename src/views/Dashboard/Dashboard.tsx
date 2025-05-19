import { Card, DatePicker, Flex } from 'antd'
import { CalendarClock, CheckCircle, Hourglass, Package } from 'lucide-react'
import { AreaChart } from './components/AreaChart'
import { ColumnChart } from './components/ColumnChart'
import { DashboardCard } from './components/DashboardCard'
import styles from './Dashboard.module.less'

const { RangePicker } = DatePicker

export function Dashboard() {
  const data = [
    {
      title: '今日订单',
      icon: <CalendarClock />,
      value: 5,
      growth: 23,
    },
    {
      title: '待选订单',
      icon: <Hourglass />,
      value: 3,
      growth: -23,
      color: 'green',
    },
    {
      title: '已完成订单',
      icon: <CheckCircle />,
      value: 300,
      growth: -5,
      color: 'gold',
    },
    {
      title: '总订单数',
      icon: <Package />,
      value: 432,
      growth: 23,
      color: 'magenta',
    },
  ]

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
