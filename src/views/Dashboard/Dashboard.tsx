import { CalendarClock, Check, CheckCircle, Clock, FileEdit, Hourglass, Package } from 'lucide-react'
import { DashboardCard } from './components/DashboardCard'
import { AreaChart } from './components/AreaChart'
import styles from './Dashboard.module.less'

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
    },
    {
      title: '已完成订单',
      icon: <CheckCircle />,
      value: 300,
      growth: -5,
    },
    {
      title: '总订单数',
      icon: <Package />,
      value: 432,
      growth: 23,
    },
  ]

  return (
    <div className={styles.content}>
      <DashboardCard data={data} />

      <div className={styles['content-chart']}>
        <div className={styles['content-chart__header']}>
          <div className={styles['content-chart__title']}>本周选片趋势</div>
          <div className={styles['content-chart__desc']}>本周与上周的选片数量对比</div>
        </div>
        <AreaChart />
      </div>
    </div>
  )
}
