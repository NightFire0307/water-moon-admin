import type { IUser } from '@/types/user.ts'
import type { UserFormModalProps } from '@/views/User/UserFormModal.tsx'
import type { MenuProps, TableColumnProps } from 'antd'
import { createUser, delUserById, getUserList, resetUserPassword, updateUser } from '@/apis/user.ts'
import RotateCcW from '@/assets/icons/rotate-ccw.svg?react'
import UserFormModal from '@/views/User/UserFormModal.tsx'
import UserResetPwdModal from '@/views/User/UserResetPwdModal.tsx'
import { DeleteOutlined, EditOutlined, ExclamationCircleFilled, MoreOutlined, SearchOutlined, UserAddOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex, Form, Input, message, Modal, Space, Switch, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

type IUserFormModal = Omit<UserFormModalProps, 'onClose' | 'onSubmit'>

interface ActionProps {
  onEdit: () => void
  onDelete: () => void
  onResetPwd: () => void
  onViewDetail: () => void
}

enum MoreAction {
  EDIT = 'edit',
  DELETE = 'delete',
  VIEW_DETAIL = 'view_detail',
  RESET_PWD = 'reset_pwd',
}

const { confirm } = Modal

function Action(props: ActionProps) {
  const { onEdit, onDelete, onResetPwd, onViewDetail } = props

  const moreActionItems: MenuProps['items'] = [
    {
      key: MoreAction.EDIT,
      label: '编辑',
      icon: <EditOutlined />,
    },
    {
      key: MoreAction.RESET_PWD,
      label: '重置密码',
      icon: <RotateCcW />,
    },
    {
      type: 'divider',
    },
    {
      key: MoreAction.DELETE,
      label: '删除',
      danger: true,
      icon: <DeleteOutlined />,
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
      case MoreAction.EDIT:
        onEdit()
        break
      case MoreAction.DELETE:
        confirm({
          title: '是否删除该用户？',
          icon: <ExclamationCircleFilled />,
          content: '删除后不可恢复，请谨慎操作',
          onOk() {
            onDelete()
          },
          onCancel() {
            message.info('已取消操作')
          },
        })
        break
      default:
        break
    }
  }

  return (
    <Dropdown menu={{ items: moreActionItems, onClick: handleMoreAction }}>
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
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
      render: (value: boolean, record) => (
        <Switch
          checked={value}
          checkedChildren="已冻结"
          unCheckedChildren="未冻结"
          onChange={value => handleSwitchChange(value, record.user_id)}
        />
      ),
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

  async function handleUserDelete(userId: number) {
    await delUserById(userId)
    message.success('用户删除成功')
  }

  async function handleUserResetPwd(value: { password: string, confirmPassword: string, userId: number }) {
    const { msg } = await resetUserPassword(value)
    message.success(msg)
    setUserResetPwdModal({ open: false, userId: -1 })
  }

  async function fetchUser() {
    const { data } = await getUserList({ pageSize: 10, current: 1 })
    setTableData(data.list)
  }

  async function handleSwitchChange(value: boolean, userId: number) {
    setTableData((prev) => {
      for (const data of prev) {
        if (data.user_id === userId) {
          data.isFrozen = value
          break
        }
      }

      return [...prev]
    })

    try {
      await updateUser(userId, { isFrozen: value })
      message.success('用户状态更新成功')
    }
    catch {
      message.error('用户状态更新失败')
    }
  }

  async function handleCreateUser(value: IUser) {
    await createUser(value)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <div style={{ padding: 24 }}>
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
      </Space>
      <UserFormModal
        open={userFormModal.open}
        mode={userFormModal.mode}
        initialValues={userFormModal.initialValues}
        onCreate={handleCreateUser}
        onUpdate={() => {}}
        onClose={() => setUserFormModal({ open: false, mode: 'create' })}
      />
      <UserResetPwdModal
        open={userResetPwdModal.open}
        userId={userResetPwdModal.userId}
        onClose={() => setUserResetPwdModal({ open: false, userId: -1 })}
        onReset={handleUserResetPwd}
      />
    </div>
  )
}

export default User
