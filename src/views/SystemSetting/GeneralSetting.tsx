import { NotificationOutlined, SecurityScanOutlined, UserOutlined } from '@ant-design/icons'
import { Tabs, type TabsProps } from 'antd'

function GeneralSetting() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '常规',
      icon: <UserOutlined />,
      children: '这是常规设置的内容',
    },
    {
      key: '2',
      label: '通知',
      icon: <NotificationOutlined />,
      children: '这是通知设置的内容',
    },
    {
      key: '3',
      label: '安全',
      icon: <SecurityScanOutlined />,
      children: '这是安全设置的内容',
    },
  ]

  return <Tabs defaultActiveKey="1" items={items} tabBarStyle={{ padding: '0 24px' }} />
}

export default GeneralSetting
