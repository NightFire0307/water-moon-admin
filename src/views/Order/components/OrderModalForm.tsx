import type { TableProps } from 'antd/lib/index'
import type { BasicFormRef } from '@/components/BasicForm/BasicForm'
import type { IOrderDetail } from '@/types/order'
import type { IProduct } from '@/types/product.ts'
import { Button, Divider, message, Modal, Popconfirm, Table } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createOrder } from '@/apis/order'
import { getPackageById, getPackageList } from '@/apis/package.ts'
import { getProductList } from '@/apis/product.ts'
import IconTrash from '@/assets/icons/trash.svg?react'
import { BasicForm } from '@/components/BasicForm'
import { getOrderModalFormSchema, type OrderModalFormData } from './OrderModalFormSchema.tsx'

export interface OrderModalFormProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  // 添加初始数据属性
  initialValues?: Partial<IOrderDetail>
}

interface DataType {
  key: number
  id: number
  name: string
  type: 'package' | 'single'
  count: number
}

export function OrderModalForm(props: Readonly<OrderModalFormProps>) {
  const { open, mode, initialValues, onClose } = props
  const [dataSource, setDataSource] = useState<DataType[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const singleProducts = useRef<IProduct[]>([]) // 缓存单品列表
  const basicFormRef = useRef<BasicFormRef<OrderModalFormData>>(null)

  const formSchema = useMemo(() => {
    return getOrderModalFormSchema({
      mode,
      onAddProducts: handleAddProducts,
      getPackageList: async (values) => {
        if (values.productType === 'package') {
          const { data } = await getPackageList({ current: 1, pageSize: 100 })
          return data.list.map(item => ({ label: item.name, value: item.id }))
        }
        return []
      },
      getSingleProductList: async (values) => {
        if (values.productType === 'single') {
          const { data } = await getProductList({ current: 1, pageSize: 100 })
          singleProducts.current = data.list
          return data.list.map(item => ({ label: item.name, value: item.id }))
        }
        return []
      },
    })
  }, [mode])

  // 根据选择的产品类型，调用不同的添加函数
  function handleAddProducts() {
    const productType = basicFormRef.current?.getFieldValue('productType')

    if (productType === 'package') {
      handleAddPackage()
    }
    else if (productType === 'single') {
      handleAddProduct()
    }
  }

  // 检测是否存在重复添加的套餐或产品
  function addOrUpdateItem(prev: DataType[], newItem: DataType): DataType[] {
    const existingItem = prev.find(item => item.id === newItem.id)

    if (existingItem) {
      return prev.map((item) => {
        // 如果是同一类型的产品，更新数量
        if (item.id === newItem.id && item.type === newItem.type) {
          return {
            ...item,
            count: item.count + newItem.count,
          }
        }

        return item
      })
    }

    return [...prev, newItem]
  }

  async function handleAddPackage() {
    const packageId = basicFormRef.current?.getFieldValue('packageId')
    // TODO: 添加套餐逻辑
    const { data } = await getPackageById(packageId)

    const newPackage = {
      key: data.id,
      id: data.id,
      name: data.name,
      type: 'package',
      count: 1,
      children: data.items.map(item => ({
        key: item.id,
        id: item.id,
        name: item.name,
        type: 'single',
        count: item.count,
      })),
    }

    setDataSource(prev => addOrUpdateItem(prev, newPackage))
  }

  function handleAddProduct() {
    const productId = basicFormRef.current?.getFieldValue('singleProductId')
    const productCount = basicFormRef.current?.getFieldValue('count') || 1
    // TODO: 添加单个产品逻辑
    const product = singleProducts.current.find(item => item.id === productId)
    if (!product)
      return

    const newProduct: DataType = {
      key: product.id,
      id: product.id,
      name: product.name,
      type: 'single',
      count: productCount,
    }
    setDataSource(prev => addOrUpdateItem(prev, newProduct))
  }

  const columns: TableProps<DataType>['columns'] = [
    {
      title: '消费项目',
      dataIndex: 'name',
    },
    {
      title: '类别',
      dataIndex: 'type',
    },
    {
      title: '数量',
      dataIndex: 'count',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => (
        <Popconfirm
          title="确定删除吗？"
          okText="确定"
          cancelText="取消"
          onConfirm={() => {
            setDataSource(dataSource.filter(item => item.key !== record.key))
          }}
        >
          <Button type="text" icon={<IconTrash />} danger />
        </Popconfirm>
      ),
    },
  ]

  async function handleOk() {
    setConfirmLoading(true)
    try {
      await basicFormRef.current?.validate()
      const values = basicFormRef.current?.getFieldsValue()
      if (!values)
        return

      console.log(values)

      // 检查是否添加产品
      if (dataSource.length === 0) {
        message.warning('请至少添加一个产品')
        return
      }

      if (mode === 'create') {
        const { msg } = await createOrder({
          orderNumber: values.orderNumber,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          maxSelectPhotos: values.maxSelectPhotos,
          extraPhotoPrice: values.extraPhotoPrice,
          validUntil: dayjs().add(values.validUntil, 'day').toDate(),
          orderProducts: dataSource.map(item => ({
            type: item.type,
            id: item.id,
            count: item.count,
          })),
        })
        message.success(msg)
        handleCancel()
      }
      else {
        // const response = await updateOrder(initialValues!.id!, {
        //   ...values,
        //   valid_until: dayjs().add(values.validUntil, 'day').toDate(),
        //   orderProducts: dataSource.map(item => ({ id: item.id, count: item.count })),
        // })
        // message.success(response.msg || '更新订单成功')
        // handleCancel()
      }
    }
    catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '操作失败，请重试')
      }
      else {
        message.error('表单填写有误，请检查')
      }
    }
    finally {
      setConfirmLoading(false)
    }
  }

  function handleCancel() {
    onClose()
    basicFormRef.current?.getFieldsValue()
  }

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      basicFormRef.current?.getFieldsValue()
    }
  }, [open, mode, initialValues])

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '创建订单' : '编辑订单'}
      okText={mode === 'create' ? '创建' : '更新'}
      width={900}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnHidden
    >

      <BasicForm
        ref={basicFormRef}
        schema={formSchema}
        initialValues={{ maxSelectPhotos: 1, extraPhotoPrice: 100, validUntil: 7, productType: 'package', count: 1 }}
        showDefaultButtons={false}
      />

      <Divider>已添加产品</Divider>
      <Table
        columns={columns}
        dataSource={dataSource}
        bordered={false}
        pagination={false}
        footer={() => `合计数量：${dataSource.reduce((prev, curr) => prev + curr.count, 0)}`}
        scroll={{ y: dataSource.length > 2 ? 65 * 2 : undefined }}
      />
    </Modal>
  )
}
