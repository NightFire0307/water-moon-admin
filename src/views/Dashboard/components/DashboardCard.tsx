import type { FC, ReactNode } from 'react'
import { Card } from 'antd'
import cs from 'classnames'
import { ArrowUp } from 'lucide-react'
import CountUp from 'react-countup'
import styles from './DashboardCard.module.less'

interface CardDataItem {
  icon: ReactNode
  title: string
  value: number
  growth: number
  color?: string
}

interface DashboardProps {
  data: CardDataItem[]
}

const CardItem: FC<CardDataItem> = ({ icon, title, value, growth, color }) => {
  return (
    <Card
      hoverable
      className={styles['dashboard-card']}
    >
      <div className={styles['dashboard-card__content']}>
        <div>
          <div className={styles['dashboard-card__title']}>
            {title}
          </div>
          <div className={styles['dashboard-card__value']}>
            <CountUp end={value} />
          </div>
          <div className={styles['dashboard-card__desc']}>
            <span
              className={cs(
                styles['dashboard-card__change'],
                growth > 0
                  ? styles['dashboard-card__change--positive']
                  : styles['dashboard-card__change--negative'],
              )}
            >
              <span>
                <ArrowUp size={12} />
              </span>
              {growth > 0 ? `+${growth}` : growth}
              %
            </span>
            <span>vs 昨天</span>
          </div>
        </div>

        <div className={cs(styles['dashboard-card__icon'], styles[`dashboard-card__icon--${color ?? 'blue'}`])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

export const DashboardCard: FC<DashboardProps> = ({ data }) => {
  return (
    <div className={styles['dashboard-card__wrapper']}>
      {
        data.map(item => (
          <CardItem
            icon={item.icon}
            title={item.title}
            value={item.value}
            growth={item.growth}
            color={item.color}
          />
        ))
      }
    </div>
  )
}
