import type { IRole } from '@/types/role'
import type { TableProps } from 'antd/lib'
import { createRole, deleteRole, getRoleByRoleId, getRoleList, updateRole } from '@/apis/role'
import useTableSelection from '@/hooks/useTableSelection'
import { SearchOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, message, Modal, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { type FC, useEffect, useState } from 'react'
import ActionButton from './components/ActionButton'
import RoleFormModal, { type RoleFormModalProps } from './RoleFormModal'

const { confirm } = Modal

type RoleFormState = Omit<RoleFormModalProps, 'onClose'>

interface RoleDataType {
  roleId: number
  name: string
  description: string
}

const Role: FC = () => {
  const [roleFormState, setRoleFormState] = useState<RoleFormState>({
    mode: 'create',
    open: false,
  })
  const [dataSource, setDataSource] = useState<IRole[]>([])
  const [initValues, setInitValues] = useState<IRole | null>(null)

  const { rowSelection } = useTableSelection({ type: 'checkbox' })

  const columns: TableProps<RoleDataType>['columns'] = [
    {
      dataIndex: 'roleId',
      title: '角色ID',
    },
    {
      dataIndex: 'code',
      title: '角色编码',
    },
    {
      dataIndex: 'name',
      title: '角色名称',
    },
    {
      dataIndex: 'description',
      title: '角色描述',
    },
    {
      dataIndex: 'createTime',
      title: '创建时间',
      render: text => (dayjs(text).format('YYYY-MM-DD HH:mm:ss')),
    },
    {
      title: '操作',
      render: (_, record) => (
        <ActionButton
          onEdit={() => handleEdit(record.roleId)}
          onDelete={() => handleDeleteRole(record.roleId)}
        />
      ),
    },
  ]

  const handleCreateRole = async (values: any) => {
    await createRole(values)
    message.success('创建成功')
    setRoleFormState({ open: false, mode: 'create' })
    fetchRoles()
  }

  const handleEditRole = async (roleId: number, values: any) => {
    await updateRole(roleId, values)
    message.success('编辑成功')
    setRoleFormState({ open: false, mode: 'create' })
    fetchRoles()
  }

  async function fetchRoles() {
    const { data } = await getRoleList({})
    setDataSource(data.list)
  }

  async function handleEdit(roleId: number) {
    const { data } = await getRoleByRoleId(roleId)
    setInitValues(data)
    setRoleFormState({ open: true, mode: 'edit' })
  }

  function handleDeleteRole(roleId: number) {
    confirm({
      title: '是否删除该角色?',
      content: '删除后该角色将无法恢复',
      async onOk() {
        await deleteRole(roleId)
        message.success('删除成功')
        fetchRoles()
      },
      onCancel() {
        message.info('取消删除')
      },
    })
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '24px' }}>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Input placeholder="请输入角色名称" prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Form>

        <Button type="primary" onClick={() => setRoleFormState(prev => ({ ...prev, open: true, mode: 'create' }))}>创建角色</Button>
      </Flex>

      <Table
        rowKey="roleId"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
      />

      <RoleFormModal
        open={roleFormState.open}
        mode={roleFormState.mode}
        initValues={initValues}
        onCreate={handleCreateRole}
        onEdit={handleEditRole}
        onClose={() => setRoleFormState(prev => ({ ...prev, open: false }))}
      />
    </Space>
  )
}

export default Role
