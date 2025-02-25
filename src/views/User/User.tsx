import type { IUser } from '@/types/user.ts'
import type { UserFormModalProps } from '@/views/User/UserFormModal.tsx'
import type { MenuProps, TableColumnProps } from 'antd'
import { getUserList, resetUserPassword } from '@/apis/user.ts'
import UserFormModal from '@/views/User/UserFormModal.tsx'
import UserResetPwdModal from '@/views/User/UserResetPwdModal.tsx'
import { DeleteOutlined, EditOutlined, MoreOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Form, Input, message, Space, Switch, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

type IUserFormModal = Omit<UserFormModalProps, 'onClose'>

interface ActionProps {
  onEdit: () => void
  onDelete: () => void
  onResetPwd: () => void
  onViewDetail: () => void
}

enum MoreAction {
  VIEW_DETAIL = 'view_detail',
  RESET_PWD = 'reset_pwd',
}

function Action(props: ActionProps) {
  const { onEdit, onDelete, onResetPwd, onViewDetail } = props

  const moreActionItems: MenuProps['items'] = [
    {
      key: MoreAction.VIEW_DETAIL,
      label: '查看详情',
    },
    {
      key: MoreAction.RESET_PWD,
      label: '重置密码',
    },
  ]

  function handleMoreAction({ key }: { key: string }) {
    switch (key) {
      case MoreAction.VIEW_DETAIL:
        onViewDetail()
        break
      case MoreAction.RESET_PWD:
        onResetPwd()
        break
      default:
        break
    }
  }

  return (
    <Space>
      <Button type="link" icon={<EditOutlined />} onClick={onEdit}>编辑</Button>
      <Button type="link" icon={<DeleteOutlined />} danger onClick={onDelete}>删除</Button>
      <Dropdown menu={{ items: moreActionItems, onClick: handleMoreAction }}>
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    </Space>
  )
}

function User() {
  const [tableData, setTableData] = useState<IUser[]>([])
  const [userFormModal, setUserFormModal] = useState<IUserFormModal>({ open: false, mode: 'create' })
  const [userResetPwdModal, setUserResetPwdModal] = useState<{ open: boolean, userId: number }>({ open: false, userId: -1 })

  const columns: TableColumnProps[] = [
    {
      dataIndex: 'username',
      title: '用户名',
    },
    {
      dataIndex: 'phone',
      title: '手机号',
    },
    {
      dataIndex: 'isAdmin',
      title: '是否管理员',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>{value ? '是' : '否'}</Tag>
      ),
    },
    {
      dataIndex: 'isFrozen',
      title: '是否冻结',
      render: (value: boolean) => <Switch value={value} checkedChildren="已冻结" unCheckedChildren="未冻结" />,
    },
    {
      dataIndex: 'createTime',
      title: '注册时间',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      dataIndex: 'action',
      title: '操作',
      render: (_, record) => (
        <Action
          onEdit={() => handleUserEdit(record as IUser)}
          onDelete={() => handleUserDelete((record as IUser).user_id)}
          onResetPwd={() => setUserResetPwdModal({ open: true, userId: (record as IUser).user_id })}
          onViewDetail={() => {}}
        />
      ),
    },
  ]

  function handleUserAdd() {
    setUserFormModal({ open: true, mode: 'create' })
  }

  function handleUserEdit(record: IUser) {
    setUserFormModal({ open: true, mode: 'edit', initialValues: record })
  }

  function handleUserDelete(userId: number) {
    console.log(userId)
  }

  async function handleUserResetPwd(value) {
    const { msg } = await resetUserPassword(value)
    message.success(msg)
    setUserResetPwdModal({ open: false, userId: -1 })
  }

  async function fetchUser() {
    const { data } = await getUserList({ pageSize: 10, current: 1 })
    setTableData(data.list)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Flex justify="space-between">
        <Form layout="inline">
          <Form.Item>
            <Input placeholder="请输入用户名/手机号" prefix={<SearchOutlined />} />
          </Form.Item>
        </Form>
        <Button type="primary" icon={<UserAddOutlined />} onClick={handleUserAdd}>新增用户</Button>
      </Flex>
      <Table rowSelection={{ type: 'checkbox' }} rowKey="user_id" columns={columns} dataSource={tableData} />
      <UserFormModal
        open={userFormModal.open}
        mode={userFormModal.mode}
        initialValues={userFormModal.initialValues}
        onClose={() => setUserFormModal({ open: false, mode: 'create' })}
      />
      <UserResetPwdModal
        open={userResetPwdModal.open}
        userId={userResetPwdModal.userId}
        onClose={() => setUserResetPwdModal({ open: false, userId: -1 })}
        onReset={handleUserResetPwd}
      />
    </Space>
  )
}

export default User
