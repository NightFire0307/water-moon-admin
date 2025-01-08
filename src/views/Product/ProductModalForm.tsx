import type { IProductType } from '@/types/product.ts'
import type { ProductFormRef } from '../../components/CustomForm.tsx'
import { CustomForm } from '@/components/CustomForm.tsx'
import { Button, Modal, Space } from 'antd'
import { useEffect, useRef, useState } from 'react'

interface ProductModalFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialData?: { id: number, name: string, productTypeId: number }
  productTypeOptions: IProductType[]
  onClose: () => void
  onCreate: (values: any) => void
  onUpdate: (id: number, values: any) => void
}

export function ProductModalForm(props: ProductModalFormProps) {
  const { mode, open, onClose, productTypeOptions, onCreate, onUpdate, initialData } = props
  const formRef = useRef<ProductFormRef>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  function handleSubmit(values: { name: string, productTypeId: number }) {
    setConfirmLoading(true)
    if (mode === 'create') {
      onCreate(values)
    }
    else if (mode === 'edit' && initialData) {
      onUpdate(initialData.id, values)
    }
    setConfirmLoading(false)
  }

  useEffect(() => {
    if (!open) {
      formRef.current?.resetForm()
    }

    if (open && mode === 'edit') {
      formRef.current?.setFormValues(initialData)
    }
  }, [open, mode, initialData])

  return (
    <Modal
      title={mode === 'create' ? '新增产品' : '编辑产品'}
      open={open}
      footer={null}
      onCancel={onClose}
      confirmLoading={confirmLoading}
      centered
    >
      <CustomForm
        ref={formRef}
        fields={[
          {
            label: '产品名称',
            name: 'name',
            type: 'input',
            placeholder: '请输入产品名称',
          },
          {
            label: '产品类型',
            name: 'productTypeId',
            type: 'select',
            placeholder: '请选择产品类型',
            options: productTypeOptions,
            filedNames: { label: 'name', value: 'id' },
          },
        ]}
        footer={(
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" htmlType="submit">创建</Button>
          </Space>
        )}
        onSubmit={handleSubmit}
      />
    </Modal>
  )
}
