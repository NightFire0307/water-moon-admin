import type { MenuProps } from 'antd/lib'
import type { FC } from 'react'
import { EditOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'
import { Trash } from 'lucide-react'

interface PackageActionsProps {
  onEdit?: () => void
  onDelete?: () => void
}

export const PackageActions: FC<PackageActionsProps> = ({ onEdit, onDelete }) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除',
      danger: true,
      icon: <Trash size={14} />,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'edit':
        onEdit?.()
        break
      case 'delete':
        onDelete?.()
        break
      default:
        console.warn(`Unhandled action type: ${key}`)
        break
    }
  }

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  )
}
