import type { MenuProps } from 'antd'
import {
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet, useMatches, useNavigate } from 'react-router-dom'
import styles from './AdminLayout.module.less'

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
    const breadcrumbItems: ItemType = []
    for (const match of matches) {
      breadcrumbItems.push({ title: (match.handle as MatchType)?.title || '' })
    }

    setBreadcrumb(breadcrumbItems)

    // 设置选中的菜单项
    const selectKey: string = matches[matches.length - 1].pathname.split('/').pop() || ''
    setSelectedKeys([selectKey])

    // 设置展开的菜单项
    const openKey: string = matches[matches.length - 2].pathname.split('/').pop() || ''
    setOpenKeys([openKey])
  }, [matches])

  const menuItems: MenuItem[] = [
    {
      key: 'system',
      icon: <UserOutlined />,
      label: '系统管理',
      children: [
        { key: 'user', label: '用户列表' },
        { key: 'role', label: '角色列表' },
        { key: 'permission', label: '权限列表' },
      ],
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={{ position: 'relative' }} width={250} collapsedWidth={65} trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>LOGO</div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          onOpenChange={openKey => setOpenKeys(openKey)}
        />

        <button className={styles.collapseButton} onClick={toggle}>
          {
            collapsed ? <RightOutlined /> : <LeftOutlined />
          }
        </button>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          这是头部
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb items={breadcrumb} style={{ margin: '16px 0' }}>
          </Breadcrumb>
          <div className={styles.content}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
