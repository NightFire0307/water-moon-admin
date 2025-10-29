import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  SafetyCertificateOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Button, Flex, Layout, Menu } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useMatches, useNavigate } from 'react-router-dom'
import PanelLeftClose from '@/assets/icons/panel-left-close.svg?react'
import PanelLeftOpen from '@/assets/icons/panel-left-open.svg?react'
import reactSvg from '@/assets/react.svg'
import UserMenu from '@/components/UserMenu/UserMenu.tsx'
import styles from './AdminLayout.module.less'
import { GlobalNotification } from '@/components/GlobalNotification/GlobalNotification'

type MenuItem = Required<MenuProps>['items'][number]
type ItemType = { title: string }[]
interface MatchType { title: string }

const { Header, Sider, Content } = Layout

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [breadcrumb, setBreadcrumb] = useState<ItemType>([])
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['/product/list'])
  const [openKeys, setOpenKeys] = useState<string[]>(['/product'])
  const navigate = useNavigate()
  const matches = useMatches()

  useEffect(() => {
    // 构建面包屑
    const breadcrumbItems = matches
      .filter(match => (match.handle as MatchType)?.title)
      .map(match => ({ title: (match.handle as MatchType)?.title || '' }))

    setBreadcrumb(breadcrumbItems)

    // 设置选中菜单项
    const pathname = matches[matches.length - 1]?.pathname || ''
    const routeParts = pathname.split('/').filter(Boolean)
    const selectKey = routeParts.length ? routeParts[routeParts.length - 1] : ''

    if (selectKey) {
      setSelectedKeys([selectKey])
    }

    // 设置展开菜单项
    if (routeParts.length > 1) {
      const openKey = routeParts[routeParts.length - 2]
      setOpenKeys([openKey])
    }
  }, [matches])

  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'user',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'role',
      icon: <SafetyCertificateOutlined />,
      label: '角色管理',
    },
    {
      key: 'selection',
      icon: <VideoCameraOutlined />,
      label: '选片管理',
      children: [
        { key: 'order', label: '订单列表' },
      ],
    },
    {
      key: 'product',
      icon: <UploadOutlined />,
      label: '产品管理',
      children: [
        { key: 'list', label: '产品列表' },
        { key: 'type', label: '产品类型' },
        { key: 'package', label: '产品套餐' },
      ],
    },
  ]

  const toggle = () => {
    setCollapsed(!collapsed)
  }

  function handleMenuClick({ keyPath }: { keyPath: string[] }) {
    const route = keyPath.reverse().join('/')
    navigate(route)
  }

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider className={styles.siderWrapper} width={250} collapsedWidth={65} trigger={null} collapsible collapsed={collapsed} theme="light">
          <Flex vertical>
            <div className={styles.logoWrapper}>
              <img src={reactSvg} alt="React Logo" width={32} height={32} />
              <div className={styles.logo}>Aqua Admin</div>
            </div>

            <div className={styles.menuWrapper}>
              <Menu
                style={{ height: '100%' }}
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                items={menuItems}
                onClick={handleMenuClick}
                onOpenChange={openKey => setOpenKeys(openKey)}
              />

            </div>

            <UserMenu collapsed={collapsed} />
          </Flex>
        </Sider>
        <Layout>
          <Header className={styles['header-wrapper']}>
            <Button
              type="text"
              icon={!collapsed
                ? <PanelLeftClose width={20} height={20} style={{ color: '#434343' }} />
                : <PanelLeftOpen width={20} height={20} style={{ color: '#434343' }} />}
              onClick={toggle}
            />
            <Breadcrumb items={breadcrumb} style={{ margin: '16px 0', fontWeight: 600 }} />
          </Header>
          <Content style={{ position: 'relative', overflowX: 'hidden', background: '#f5f5f5', padding: '16px' }}>
            <div className={styles.content}>
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>

      <GlobalNotification />
    </>
  )
}

export default AdminLayout
