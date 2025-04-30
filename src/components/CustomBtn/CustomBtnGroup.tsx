import { Flex } from 'antd'
import cs from 'classnames'
import { type FC, type PropsWithChildren, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { CustomBtn } from './CustomBtn'
import btnStyles from './CustomBtn.module.less'

export interface CustomBtnItemType {
  key: string
  label: string
  icon?: ReactElement
  children: ReactNode
}

interface CustomBtnProps {
  items: CustomBtnItemType[]
  activeKey?: string
  onChange?: (value: any) => void
}

export const CustomBtnGroup: FC<PropsWithChildren<CustomBtnProps>> = ({ items, onChange, activeKey }) => {
  const [selected, setSelected] = useState<string>(activeKey ?? items[0].key)

  // 监听 activeKey 的变化
  useEffect(() => {
    if (activeKey !== undefined) {
      setSelected(activeKey)
    }
  }, [activeKey])

  const handleClick = (value: any) => {
    onChange && onChange(value)
    setSelected(value)
  }

  return (
    <Flex vertical gap={8}>
      {
        items.map(item => (
          <CustomBtn
            value={item.key}
            key={item.key}
            icon={item.icon}
            onClick={() => handleClick(item.key)}
            className={selected === item.key ? cs(btnStyles['custom-btn-active']) : ''}
          >
            {item.label}
          </CustomBtn>
        ))
      }
    </Flex>
  )
}
