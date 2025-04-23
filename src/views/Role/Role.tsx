import type { TableProps } from 'antd/lib'
import useTableSelection from '@/hooks/useTableSelection'
import { MoreOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Space, Table } from 'antd'
import { type FC, useEffect, useState } from 'react'
import RoleFormModal, { type RoleFormModalProps } from './RoleFormModal'
import { getRoleList } from '@/apis/role'
import dayjs from 'dayjs'
import type { IRole } from '@/types/role'

type RoleFormState = Omit<RoleFormModalProps, 'onClose'>

interface RoleDataType {
  role_id: string
  name: string
  description: string
}

const Role: FC = () => {
  const [roleFormState, setRoleFormState] = useState<RoleFormState>({
    mode: 'create',
    open: false,
  })
  const [dataSource, setDataSource] = useState<IRole[]>([])

  const { rowSelection } = useTableSelection({ type: 'checkbox' })

  const columns: TableProps<RoleDataType>['columns'] = [
    {
      dataIndex: 'role_id',
      title: '角色ID',
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
      render: (text) => (dayjs(text).format('YYYY-MM-DD HH:mm:ss')),
    },
    {
      title: '操作',
      render: () => (
        <Button type="text" icon={<MoreOutlined />} />
      ),
    },
  ]

  const fetchRoles = async () => {
    const { data } = await getRoleList({})
    setDataSource(data.list)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex justify="space-between">
        <Form>
          <Form.Item>
            <Input placeholder="请输入角色名称" prefix={<SearchOutlined />} allowClear />
          </Form.Item>
        </Form>

        <Button type="primary" onClick={() => setRoleFormState(prev => ({ ...prev, open: true, mode: 'create' }))}>创建角色</Button>
      </Flex>

      <Table
        rowKey="role_id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource.map(role => ({
          ...role,
          role_id: role.role_id.toString(),
        }))}
      />

      <RoleFormModal
        open={roleFormState.open}
        mode={roleFormState.mode}
        onClose={() => setRoleFormState(prev => ({ ...prev, open: false }))}
      />
    </Space>
  )
}

export default Role
