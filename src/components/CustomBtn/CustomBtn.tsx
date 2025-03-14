import type { FC, PropsWithChildren, ReactNode } from 'react'
import cs from 'classnames'
import styles from './CustomBtn.module.less'

interface CustomBtnProps {
  value: any
  icon?: ReactNode
  onClick?: () => void
  className?: string
}

export const CustomBtn: FC<PropsWithChildren<CustomBtnProps>> = ({ value, icon, onClick, children, className }) => {
  return (
    <button 
      className={cs(styles['custom-btn'], className)}
      onClick={onClick} data-value={value}>
      { icon }
      <span>{children}</span>
    </button>
  )
}
