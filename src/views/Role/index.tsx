import type { IRole } from '@/types/role'
import { Flex, message, Modal } from 'antd'
import { type FC, useEffect, useState } from 'react'
import { createRole, deleteRole, getRoleByRoleId, getRoleList, updateRole } from '@/apis/role'
import RoleFormModal, { type RoleFormModalProps } from './components/RoleFormModal'
import { RoleSearchForm } from './components/RoleSearchForm'
import { RoleTable } from './components/RoleTable'

const { confirm } = Modal

type RoleFormState = Omit<RoleFormModalProps, 'onClose'>

const Role: FC = () => {
  const [roleFormState, setRoleFormState] = useState<RoleFormState>({
    mode: 'create',
    open: false,
  })
  const [dataSource, setDataSource] = useState<IRole[]>([])
  const [initValues, setInitValues] = useState<IRole | null>(null)

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

  async function handleTableEdit(roleId: number) {
    const { data } = await getRoleByRoleId(roleId)
    setInitValues(data)
    setRoleFormState({ open: true, mode: 'edit' })
  }

  function handleTableDelete(roleId: number) {
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

  async function fetchRoles() {
    const { data } = await getRoleList({})
    setDataSource(data.list)
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  return (
    <Flex vertical gap={16}>
      <RoleSearchForm onSearch={value => console.log(value)} />

      <RoleTable
        dataSource={dataSource}
        onRoleCreate={() => setRoleFormState({ open: true, mode: 'create' })}
        onRoleEdit={handleTableEdit}
        onRoleDelete={handleTableDelete}
      />

      <RoleFormModal
        open={roleFormState.open}
        mode={roleFormState.mode}
        initValues={initValues}
        onCreate={handleCreateRole}
        onEdit={handleEditRole}
        onClose={() => setRoleFormState(prev => ({ ...prev, open: false }))}
      />
    </Flex>

  )
}

export default Role
