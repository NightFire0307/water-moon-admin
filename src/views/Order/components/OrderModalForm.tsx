import type { GetRef, TableProps } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import type { PaginationParams } from '@/types/common'
import type { IOrderDetail } from '@/types/order'
import type { IPackage } from '@/types/package'
import type { IProduct } from '@/types/product'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Flex, Form, InputNumber, message, Modal, Popconfirm, Row, Select, Table } from 'antd'
import dayjs from 'dayjs'
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createOrder, updateOrder } from '@/apis/order'
import { getPackageList } from '@/apis/package'
import { getProductList } from '@/apis/product'
import IconTrash from '@/assets/icons/trash.svg?react'
import { BasicForm } from '@/components/BasicForm'
import { getOrderModalFormSchema } from './orderModalFormSchema'
import type { BasicFormRef } from '@/components/BasicForm/BasicForm'

// 获取 Form 实例类型
type FormInstance<T> = GetRef<typeof Form<T>>
const EditableContext = createContext<FormInstance<any> | null>(null)

interface EditableRowProps {
  index: number
}

// EditableRow 组件
const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  )
}

interface Item {
  id: number
  key: number
  name: string
  type: string
  count: number
}

interface EditableCellProps {
  title: ReactNode
  editable?: boolean
  dataIndex?: keyof Item
  record: Item
  handleSave: (record: Item) => void
}

// EditableCell 组件
const EditableCell: FC<PropsWithChildren<EditableCellProps>> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const form = useContext(EditableContext)!

  const save = () => {
    const values = form.getFieldsValue()
    handleSave({ ...record, ...values })
  }

  return (
    <td {...restProps}>
      {editable
        ? (
            <Form.Item name="count" initialValue={record.count} noStyle>
              <InputNumber
                min={1}
                onPressEnter={save}
                onBlur={save}
              />
            </Form.Item>
          )
        : (
            children
          )}
    </td>
  )
}

export interface OrderModalFormProps {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  // 添加初始数据属性
  initialValues?: Partial<IOrderDetail>
}

type ColumnTypes = Exclude<TableProps<Item>['columns'], undefined>

export function OrderModalForm(props: Readonly<OrderModalFormProps>) {
  const { open, mode, initialValues, onClose } = props
  const [productOptions, setProductOptions] = useState<IProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number>()
  const [packageState, setPackageState] = useState<{ options: IPackage[], selectedId?: number }>({
    options: [],
  })
  const [selectedCount, setSelectedCount] = useState<number>(1)
  const [dataSource, setDataSource] = useState<Item[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const basicFormRef = useRef<BasicFormRef>(null)

  const formSchema = useMemo(() => {
    return getOrderModalFormSchema({ mode })
  }, [mode])

  const handleSave = (row: Item) => {
    const newData = [...dataSource]
    const data = newData.find(item => row.key === item.key)
    if (data) {
      data.count = row.count
      setDataSource(newData)
    }
  }

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean, dataIndex: string })[] = [
    {
      title: '产品名称',
      dataIndex: 'name',
    },
    {
      title: '产品类型',
      dataIndex: 'type',
    },
    {
      title: '数量',
      dataIndex: 'count',
      editable: true,
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

  const components = {
    body: {
      cell: EditableCell,
      row: EditableRow,
    },
  }

  const columns = defaultColumns.map((col) => {
    if (!col.editable)
      return col

    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  function handleAddProduct() {
    const product = productOptions.find(item => item.id === selectedProduct)
    if (!product)
      return
    setDataSource((prev) => {
      return [
        ...prev,
        {
          key: prev.length + 1,
          id: product.id,
          name: product.name,
          type: product.type,
          count: selectedCount,
        },
      ]
    })

    setSelectedProduct(undefined)
    setSelectedCount(1)
  }

  // 添加套餐
  function handleAddPackage() {
    const pkg = packageState.options.find(item => item.id === packageState.selectedId)
    if (!pkg)
      return

    setDataSource(prev => ([
      ...prev,
      ...pkg.items.map(item => ({
        key: prev.length + 1 + item.id,
        id: item.product.id,
        name: item.product.name,
        type: item.product_type,
        count: item.count,
      })),
    ]))
  }

  async function fetchOrderProducts() {
    const { data } = await getProductList({ current: 1, pageSize: 100 })
    setProductOptions(data.list)
  }

  async function fetchPackages(params?: PaginationParams) {
    const { data } = await getPackageList(params)
    setPackageState(prev => ({ ...prev, options: data.list }))
  }

  async function handleOk() {
    setConfirmLoading(true)
    try {
      await basicFormRef.current?.validate()
      const values = basicFormRef.current?.getValues()

      // 检查是否添加产品
      if (dataSource.length === 0) {
        message.warning('请至少添加一个产品')
        return
      }

      if (mode === 'create') {
        const response = await createOrder({
          ...values,
          validUntil: dayjs().add(values.validUntil, 'day').toDate(),
          orderProducts: dataSource.map(item => ({ id: item.id, count: item.count })),
        })
        message.success(response.msg || '创建订单成功')
        handleCancel()
      }
      else {
        const response = await updateOrder(initialValues!.id!, {
          ...values,
          validUntil: dayjs().add(values.validUntil, 'day').toDate(),
          orderProducts: dataSource.map(item => ({ id: item.id, count: item.count })),
        })
        message.success(response.msg || '更新订单成功')
        handleCancel()
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
    basicFormRef.current?.getValues()
    setDataSource([])
    setSelectedProduct(undefined)
    setSelectedCount(1)
    setPackageState({ options: [], selectedId: undefined })
  }

  useEffect(() => {
    if (open) {
      fetchOrderProducts()
      fetchPackages()
    }

    if (mode === 'edit' && initialValues) {
      basicFormRef.current?.getValues()

      setDataSource(initialValues.orderProducts?.map((item, index) => ({
        key: index,
        id: item.id,
        name: item.name,
        type: item.type,
        count: item.count,
      })) || [])
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
    >

      <BasicForm
        ref={basicFormRef}
        schema={formSchema}
        initialValues={{ maxSelectPhotos: 1, extraPhotoPrice: 100, validUntil: 7 }}
        showDefaultButtons={false}
      />

      <Divider>添加产品</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="套餐">
            <Flex gap={8}>
              <Select
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder="选择套餐"
                style={{ flex: 1 }}
                options={packageState.options}
                onChange={value => setPackageState(prev => ({ ...prev, selectedId: value }))}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPackage} />
            </Flex>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="单品">
            <Flex gap={8}>
              <Select
                options={productOptions}
                fieldNames={{ label: 'name', value: 'id' }}
                placeholder="选择单品"
                style={{ flex: 1 }}
                value={selectedProduct}
                onChange={setSelectedProduct}
              />
              <InputNumber
                min={1}
                defaultValue={1}
                value={selectedCount}
                onChange={value => setSelectedCount(value ?? 1)}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddProduct}
              />
            </Flex>
          </Card>
        </Col>
      </Row>
      <Divider>已添加产品</Divider>
      <Table
        columns={columns as ColumnTypes}
        dataSource={dataSource}
        components={components}
        bordered={false}
        pagination={false}
        footer={() => `合计数量：${dataSource.reduce((prev, curr) => prev + curr.count, 0)}`}
        scroll={{ y: dataSource.length > 2 ? 65 * 2 : undefined }}
      />
    </Modal>
  )
}
