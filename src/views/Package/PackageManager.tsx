import type { TableProps } from 'antd/lib'
import type { FC } from 'react'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Table } from 'antd'
import SimpleForm, { type FieldSchema  } from '@/components/SimpleForm'
import { useForm } from 'antd/es/form/Form'

const PackageManager: FC = () => {
  const [form] = useForm()

  const columns: TableProps['columns'] = [
    {
      dataIndex: 'name',
      title: '套餐名称',
    },
    {
      dataIndex: 'status',
      title: '是否上架',
    },
    {
      title: '操作',
      render: () => (
        <Button type="text" icon={<MoreOutlined />} />
      ),
    },
  ]

  const fields: FieldSchema[] = [
    {
      type: 'input',
      name: 'name',
      placeholder: '请输入套餐名称'
    },
    {
      type: 'select',
      name: 'products',
      options: [
        {
          label: '选择1',
          value: '1'
        }
      ],
      placeholder: '请选择产品'
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <SimpleForm fields={fields} form={form} layout='inline'/>
      <Table columns={columns} />
    </div>
  )
}

export default PackageManager
