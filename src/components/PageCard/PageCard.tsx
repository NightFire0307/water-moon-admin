import type { PropsWithChildren, ReactNode } from 'react'
import { Flex } from 'antd'
import styles from './PageCard.module.less'

interface PageCardProps extends PropsWithChildren {
  title?: string
  extra?: ReactNode
}

export function PageCard({ title, extra, children }: PageCardProps) {
  return (
    <div className={styles['page-card']}>
      {
        title || extra
          ? (
              <Flex justify="space-between" align="center">
                <p className={styles['page-card__title']}>{title}</p>
                {extra}
              </Flex>
            )
          : null
      }
      {children}
    </div>
  )
}
