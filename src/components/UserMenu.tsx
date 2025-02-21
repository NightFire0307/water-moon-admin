import type { MenuProps } from 'antd'
import { useUserInfo } from '@/store/useUserInfo.tsx'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Dropdown } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './UserMenu.module.less'

enum UserMenuKey {
  Setting = 'setting',
  Logout = 'logout',
}

const userMenuItems: MenuProps['items'] = [
  {
    label: '个人设置',
    key: UserMenuKey.Setting,
    icon: <SettingOutlined />,
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

function UserMenu() {
  const userStore = useUserInfo()
  const navigate = useNavigate()

  async function handleUserMenuClick({ key }: { key: string }) {
    switch (key) {
      case UserMenuKey.Setting:
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
    <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }}>
      <div className={styles['user-menu']}>
        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
        <div>Admin</div>
      </div>
    </Dropdown>
  )
}

export default UserMenu
