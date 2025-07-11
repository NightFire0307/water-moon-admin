import type { MenuProps } from 'antd'
import ChevronsUpDown from '@/assets/icons/chevrons-up-down.svg?react'
import { useUserInfo } from '@/store/useUserInfo.tsx'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown, Flex } from 'antd'
import { User2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import styles from './UserMenu.module.less'

interface UserMenuProps {
  collapsed: boolean
}

enum UserMenuKey {
  Setting = 'setting',
  Logout = 'logout',
}

const userMenuItems: MenuProps['items'] = [
  {
    label: '个人信息',
    key: UserMenuKey.Setting,
    icon: <User2 size={14} />,
  },
  {
    type: 'divider',
  },
  {
    label: '退出登录',
    key: UserMenuKey.Logout,
    icon: <LogoutOutlined />,
  },
]

function UserMenu({ collapsed }: UserMenuProps) {
  const userStore = useUserInfo()
  const navigate = useNavigate()
  const userInfo = useUserInfo(state => state.userInfo)

  async function handleUserMenuClick({ key }: { key: string }) {
    switch (key) {
      case UserMenuKey.Setting:
        navigate('profile')
        break
      case UserMenuKey.Logout:
        await userStore.clearToken()
        navigate('/login')
        break
      default:
        break
    }
  }

  return (
    <div className={styles['user-info']}>
      <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} trigger={['click']} placement="top">
        <Flex justify="space-between" align="center" gap={8} className={styles['user-info-content']}>
          <Avatar style={{ backgroundColor: '#1677ff', minWidth: '24px' }} icon={<UserOutlined />} size={24} />
          {
            !collapsed && (
              <>
                <div style={{ fontWeight: 600, flexShrink: 0 }}>{userInfo.nickname}</div>
                <ChevronsUpDown color="#9f9fa9" style={{ marginLeft: 'auto' }} />
              </>
            )
          }

        </Flex>
      </Dropdown>
    </div>

  )
}

export default UserMenu
