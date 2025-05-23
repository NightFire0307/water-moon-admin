import type { MenuProps } from 'antd/lib'
import { DeleteOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown } from 'antd'

enum ActionButtonType {
  EDIT = 'edit',
  DELETE = 'delete',
}

interface ActionButtonProps {
  onEdit?: () => void
  onDelete?: () => void
}

function ActionButton(props: ActionButtonProps) {
  const { onEdit, onDelete } = props

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case ActionButtonType.EDIT:
        onEdit?.()
        break
      case ActionButtonType.DELETE:
        onDelete?.()
        break
      default:
        break
    }
  }

  const items: MenuProps['items'] = [
    {
      key: ActionButtonType.EDIT,
      label: '编辑',
      icon: <EditOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: ActionButtonType.DELETE,
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ]

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  )
}

export default ActionButton
