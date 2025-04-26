import { createProduct, getProductTypes, updateProduct } from '@/apis/product'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { message, Modal } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'

interface ProductModalFormProps {
  mode: 'create' | 'edit'
  open: boolean
  initialData?: { id: number, name: string, photoLimit: number, productTypeId: number, isPublished: boolean }
  onClose: () => void
}

export function ProductModalForm(props: Readonly<ProductModalFormProps>) {
  const { mode, open, onClose, initialData } = props
  const [productTypes, setProductTypes] = useState<{ label: string, value: any }[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = useForm()

  const fieldsSchema: FieldSchema[] = [
    {
      type: 'input',
      label: '产品名称',
      name: 'name',
      placeholder: '请输入产品名称',
      required: true,
    },
    {
      type: 'select',
      name: 'productTypeId',
      label: '产品类型',
      placeholder: '请选择产品类型',
      options: productTypes,
      required: true,
    },
    {
      type: 'inputNumber',
      name: 'photoLimit',
      label: '照片数量限制',
      extra: '0 表示不限制',
    },
    {
      type: 'switch',
      label: '是否上架',
      name: 'isPublished',
      valuePropName: 'checked',
      checkedChildren: '是',
      unCheckedChildren: '否',
    },
  ]

  async function handleOk() {
    setConfirmLoading(true)
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (mode === 'create') {
        const { msg } = await createProduct(values)
        message.success(msg)
      }

      if (mode === 'edit') {
        if (!initialData) {
          message.error('编辑模式下，初始数据不能为空')
          return
        }

        const { msg } = await updateProduct(initialData.id, values)
        message.success(msg)
      }
    }
    catch {
      message.error('请检查表单')
    }
    finally {
      setConfirmLoading(false)
      handleCancel()
    }
  }

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  async function fetchProductTypes() {
    const { data } = await getProductTypes({ current: 1, pageSize: 100 })
    setProductTypes(() => data.list.map((product) => {
      return {
        label: product.name,
        value: product.id,
      }
    }))
  }

  useEffect(() => {
    if (open) {
      fetchProductTypes()

      if (mode === 'edit') {
        form.setFieldsValue(initialData)
      }
    }
  }, [open, mode])

  return (
    <Modal
      title={mode === 'create' ? '新增产品' : '编辑产品'}
      open={open}
      okText={mode === 'create' ? '新增' : '更新'}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      width={600}
    >
      <SimpleForm fields={fieldsSchema} form={form} initialValues={{ photoLimit: 0, isPublished: true }} />
    </Modal>
  )
}
