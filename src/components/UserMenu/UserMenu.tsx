import type { MenuProps } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown, Flex } from 'antd'
import { User2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '@/apis/login'
import ChevronsUpDown from '@/assets/icons/chevrons-up-down.svg?react'
import { useUserInfo } from '@/store/useUserStore'
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
  const { userInfo, setUserInfo } = useUserInfo()

  async function handleUserMenuClick({ key }: { key: string }) {
    switch (key) {
      case UserMenuKey.Setting:
        navigate('profile')
        break
      case UserMenuKey.Logout:
        await logout()
        await userStore.clearToken()
        navigate('/login')
        break
      default:
        break
    }
  }

  useEffect(() => {
    (async () => {
      const res = await getCurrentUser()
      setUserInfo(res.data)
    })()
  }, [])

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
