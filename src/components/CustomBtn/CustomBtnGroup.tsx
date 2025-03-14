import { Flex } from 'antd'
import cs from 'classnames'
import { type FC, type PropsWithChildren, type ReactElement, type ReactNode, useState } from 'react'
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

  const handleClick = (value: any) => {
    onChange && onChange(value)
    activeKey ? setSelected(activeKey) : setSelected(value)
  }

  return (
    <Flex vertical gap={8}>
      {
        items.map(item => (

          <CustomBtn
            value={item.key}
            key={item.key}
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
