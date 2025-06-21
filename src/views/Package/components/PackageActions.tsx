import type { FC } from 'react'
import { MoreOutlined } from '@ant-design/icons'
import { Button } from 'antd'

export const PackageActions: FC = () => {
  return <Button type="text" icon={<MoreOutlined />} />
}
