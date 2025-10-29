import { Button, Table, type TableProps } from 'antd'
import dayjs from 'dayjs'
import { PageCard } from '@/components/PageCard'
import useTableSelection from '@/hooks/useTableSelection'
import ActionButton from './RoleTableActions'

interface RoleDataType {
  roleId: number
  name: string
  description: string
}

interface RoleTableProps {
  dataSource: RoleDataType[]
  onRoleCreate?: () => void
  onRoleEdit?: (roleId: number) => void
  onRoleDelete?: (roleId: number) => void
}

export function RoleTable({ dataSource, onRoleCreate, onRoleEdit, onRoleDelete }: RoleTableProps) {
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
          onEdit={() => onRoleEdit?.(record.roleId)}
          onDelete={() => onRoleDelete?.(record.roleId)}
        />
      ),
    },
  ]

  return (
    <PageCard
      title="角色列表"
      extra={(
        <Button type="primary" onClick={onRoleCreate}>创建角色</Button>
      )}
    >
      <Table
        rowKey="roleId"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        bordered
      />
    </PageCard>
  )
}
