import type { TableProps } from 'antd/lib'
import { createPackage } from '@/apis/package'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Divider, Space, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { Trash } from 'lucide-react'
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
      dataIndex: 'id',
      title: 'ID',
    },
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

  async function handleCreatePackage(value) {
    const { data } = await createPackage(value)
    console.log(data)
  }

  return (
    <div style={{ padding: '24px' }}>
      <SimpleForm fields={fields} form={form} layout="inline" />
      <Divider />
      <Space direction="horizontal" style={{ marginBottom: '24px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalState({ open: true, mode: 'create' })}
        >
          创建套餐
        </Button>
        <Button type="primary" icon={<Trash size={16} />} danger disabled>
          批量删除
        </Button>
      </Space>
      <Table columns={columns} />
      <PackageModal
        open={modalState.open}
        mode={modalState.mode}
        onClose={() => setModalState({ open: false, mode: 'create' })}
        onSubmit={handleCreatePackage}
      />
    </div>
  )
}

export default PackageManager
