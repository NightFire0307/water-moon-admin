import { Flex } from 'antd'
import cs from 'classnames'
import { Children, cloneElement, type FC, isValidElement, type PropsWithChildren, type ReactElement, useState } from 'react'
import btnStyles from './CustomBtn.module.less'

interface CustomBtnProps {
  onClick?: (value: any) => void
}

export const CustomBtnGroup: FC<PropsWithChildren<CustomBtnProps>> = ({ onClick, children }) => {
  const [curIndex, setCurIndex] = useState<number>(-1)

  const handleClick = (value: any, index: number) => {
    onClick && onClick(value)
    setCurIndex(index)
  }

  return (
    <Flex vertical gap={8}>
      {
        Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            return cloneElement(child as ReactElement, {
              className: curIndex === index ? cs(child.props.className, btnStyles['custom-btn-active']) : child.props.className,
              onClick: () => handleClick(child.props.value, index),
            })
          }
          return child
        })
      }
    </Flex>
  )
}
