import { Tabs, type TabsProps } from 'antd'
import { Shield, User } from 'lucide-react'
import commonStyles from './common.module.less'
import { BasicInfo } from './components/BasicInfo'

export function Profile() {
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span className={commonStyles.tabLabel}>
          <User size={14} />
          基本信息
        </span>
      ),
      children: <BasicInfo />,
    },
    {
      key: '2',
      label: (
        <span className={commonStyles.tabLabel}>
          <Shield size={14} />
          安全设置
        </span>
      ),
      children: '这是用户安全设置的内容',
    },
  ]

  return <Tabs defaultActiveKey="1" items={items} tabBarStyle={{ padding: '0 24px' }} />
}
