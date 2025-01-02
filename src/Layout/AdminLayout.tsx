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
  const navigate = useNavigate()
  const matches = useMatches()

  useEffect(() => {
    const breadcrumbItems: ItemType = []
    for (const match of matches) {
      breadcrumbItems.push({ title: (match.handle as MatchType)?.title || '' })
    }

    setBreadcrumb(breadcrumbItems)
  }, [matches])

  const menuItems: MenuItem[] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: '系统管理',
      children: [
        { key: '1-1', label: '用户列表' },
        { key: '1-2', label: '角色列表' },
        { key: '1-3', label: '权限列表' },
      ],
    },
    {
      key: '2',
      icon: <VideoCameraOutlined />,
      label: '选片管理',
      children: [
        { key: '2-1', label: '订单列表' },
      ],
    },
    {
      key: '/product',
      icon: <UploadOutlined />,
      label: '产品管理',
      children: [
        { key: '/product/list', label: '产品列表' },
        { key: '/product/type', label: '产品类型' },
      ],
    },
  ]

  const toggle = () => {
    setCollapsed(!collapsed)
  }

  function handleMenuClick({ key }: { key: string }) {
    navigate(key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider style={{ position: 'relative' }} width={250} collapsedWidth={65} trigger={null} collapsible collapsed={collapsed} theme="light">
        <div className={styles.logoWrapper}>
          <div className={styles.logo}>LOGO</div>
        </div>
        <Menu mode="inline" defaultSelectedKeys={['1-2']} items={menuItems} onClick={handleMenuClick} />

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
