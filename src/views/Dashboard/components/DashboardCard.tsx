import type { FC, ReactNode } from 'react'
import cs from 'classnames'

import styles from './DashboardCard.module.less'

interface CardDataItem {
  icon: ReactNode
  title: string
  value: number
  growth: number
}

interface DashboardProps {
  data: CardDataItem[]
}

const CardItem: FC<CardDataItem> = ({ icon, title, value, growth }) => {
  return (
    <div className={styles['dashboard-card']}>
      <div className={styles['dashboard-card__icon']}>
        {icon}
      </div>
      <div className={styles['dashboard-card__content']}>
        <div className={styles['dashboard-card__title']}>
          {title}
        </div>
        <div className={styles['dashboard-card__desc']}>
          <div className={styles['dashboard-card__value']}>
            {value}
          </div>
          <span 
          className={cs(
            styles['dashboard-card__change'],
            growth > 0 ? styles['dashboard-card__change--positive']
            : styles['dashboard-card__change--negative']
          )}>
            {growth > 0 ? `+${growth}` : growth}
            %
          </span>
        </div>
      </div>
    </div>
  )
}

export const DashboardCard: FC<DashboardProps> = ({ data }) => {
  return (
    <div className={styles['dashboard-card__wrapper']}>
      {
        data.map(item => (
          <CardItem icon={item.icon} title={item.title} value={item.value} growth={item.growth} />
        ))
      }
    </div>
  )
}
