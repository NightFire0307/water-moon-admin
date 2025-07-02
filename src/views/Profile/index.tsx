import { Tabs, type TabsProps } from 'antd'
import { Shield, User } from 'lucide-react'
import commonStyles from './common.module.less'
import { BasicInfo } from './components/BasicInfo'
import { ChangePassword } from './components/ChangePassword'

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
      children: <ChangePassword />,
    },
  ]

  return <Tabs defaultActiveKey="1" items={items} tabBarStyle={{ padding: '0 24px' }} />
}
