import { NotificationOutlined } from '@ant-design/icons'
import UserOutlined from '@ant-design/icons/lib/icons/UserOutlined'
import { Tabs, type TabsProps } from 'antd'
import { BasicInfo } from './BasicInfo'

export function Profile() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '基本信息',
      icon: <UserOutlined />,
      children: <BasicInfo />,
    },
    {
      key: '2',
      label: '安全设置',
      icon: <NotificationOutlined />,
      children: '这是用户安全设置的内容',
    },
  ]

  return <Tabs defaultActiveKey="1" items={items} tabBarStyle={{ padding: '0 24px' }} />
}
