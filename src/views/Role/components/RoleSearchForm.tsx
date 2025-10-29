import type { FormSchema } from '@/components/BasicForm/types'
import { BasicForm } from '@/components/BasicForm'
import { PageCard } from '@/components/PageCard'

interface RoleSearchFormProps {
  onSearch?: (values: Record<string, any>) => void
}

export function RoleSearchForm({ onSearch }: RoleSearchFormProps) {
  const formSchema: FormSchema[] = [
    {
      fieldName: 'roleName',
      label: '角色名称',
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色名称',
      },
    },
    {
      fieldName: 'code',
      label: '角色编码',
      component: 'Input',
      componentProps: {
        placeholder: '请输入角色编码',
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        options: [
          { label: '启用', value: 'enabled' },
          { label: '禁用', value: 'disabled' },
        ],
        style: { width: 150 },
      },
    },
  ]

  return (
    <PageCard>
      <BasicForm
        layout="inline"
        schema={formSchema}
        handleSubmit={onSearch}
        submitButtonOptions={{
          content: '搜索',
        }}
      />
    </PageCard>
  )
}
