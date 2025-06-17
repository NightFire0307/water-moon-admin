import type { TableProps } from 'antd/lib'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { type FC, useState } from 'react'
import { PackageModal } from './components/PackageModal'

interface ModalState {
  open: boolean
  mode: 'create' | 'edit'
}

const PackageManager: FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ open: false, mode: 'create' })
  const [form] = useForm()

  const columns: TableProps['columns'] = [
    {
      dataIndex: 'name',
      title: '套餐名称',
    },
    {
      dataIndex: 'price',
      title: '套餐价格',
    },
    {
      dataIndex: 'products_count',
      title: '产品数量',
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
      placeholder: '请输入套餐名称',
    },
    {
      type: 'select',
      name: 'products',
      options: [
        {
          label: '选择1',
          value: '1',
        },
      ],
      placeholder: '请选择产品',
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <SimpleForm fields={fields} form={form} layout="inline" />
      <Divider />
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalState({ open: true, mode: 'create' })}
      >
        创建套餐
      </Button>
      <Table columns={columns} />
      <PackageModal
        open={modalState.open}
        mode={modalState.mode}
        onClose={() => setModalState({ open: false, mode: 'create' })}
        onSubmit={data => console.log(data)}
      />
    </div>
  )
}

export default PackageManager
