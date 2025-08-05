import { getRoleList } from '@/apis/role'
import { getUserDetailById } from '@/apis/user'
import { useUserInfo } from '@/store/useUserInfo'
import { SaveOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Select } from 'antd'
import { useEffect, useState } from 'react'
import styles from './BasicInfo.module.less'

export function BasicInfo() {
  const [rolesOptions, setRolesOptions] = useState<{ label: string, value: number }[]>([])
  const [selectedRoles, setSelectedRoles] = useState([])
  const userInfo = useUserInfo(state => state.userInfo)
  const [form] = Form.useForm()

  async function fetchUserInfo() {
    const { data } = await getUserDetailById(userInfo.userId)

    form.setFieldsValue({
      username: data.username,
      nickname: data.nickname,
      phone: data.phone,
    })

    setSelectedRoles(data.roles.map(role => role.id))
  }

  async function fetchRoles() {
    const { data } = await getRoleList()
    setRolesOptions(data.list.map(role => ({
      label: role.name,
      value: role.roleId,
    })))
  }

  useEffect(() => {
    if (!userInfo.userId)
      return
    fetchUserInfo()
    fetchRoles()
  }, [userInfo])

  return (
    <div className={styles.basicInfo}>
      <div className={styles.basicInfo__header}>
        <h2>个人资料</h2>
        <Button icon={<SaveOutlined />} type="primary">保存更改</Button>
      </div>
      <Card>
        <Form form={form} layout="vertical">
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item label="昵称" name="nickname">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="所属角色">
            <Select value={selectedRoles} options={rolesOptions} mode="multiple" disabled />
          </Form.Item>
        </Form>
      </Card>

    </div>
  )
}
