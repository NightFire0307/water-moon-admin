import type { IProduct } from '@/types/product'
import type { GetRef, TableProps } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import { createOrder } from '@/apis/order'
import { getProductList } from '@/apis/product'
import IconTrash from '@/assets/icons/trash.svg?react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Flex, Form, Input, InputNumber, message, Modal, Popconfirm, Row, Select, Table } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { createContext, useContext, useEffect, useState } from 'react'

// 获取 Form 实例类型
type FormInstance<T> = GetRef<typeof Form<T>>
const EditableContext = createContext<FormInstance<any> | null>(null)

interface EditableRowProps {
  index: number
}

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

interface OrderModalFormProps {
  open: boolean
  onClose: () => void
}

type ColumnTypes = Exclude<TableProps<Item>['columns'], undefined>

export function OrderModalForm(props: Readonly<OrderModalFormProps>) {
  const { open, onClose } = props
  const [productOptions, setProductOptions] = useState<IProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number>()
  const [selectedCount, setSelectedCount] = useState<number>(1)
  const [dataSource, setDataSource] = useState<Item[]>([])
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [form] = useForm()

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

  async function fetchOrderProducts() {
    const { data } = await getProductList({ current: 1, pageSize: 100 })
    setProductOptions(data.list)
  }

  async function handleOk() {
    setConfirmLoading(true)
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const { msg } = await createOrder({
        ...values,
        order_products: dataSource.map(item => ({ id: item.id, count: item.count })),
      })
      message.success(msg)
      handleCancel()
    }
    catch {
      message.error('表单填写有误，请检查')
    }
    finally {
      setConfirmLoading(false)
    }
  }

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  useEffect(() => {
    if (open) {
      fetchOrderProducts()
    }
  }, [open])

  return (
    <Modal
      open={open}
      title="创建订单"
      okText="提交"
      width={900}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ max_select_photos: 1, extra_photo_price: 0 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="order_number" label="订单号" required>
              <Input placeholder="请输入订单号" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="customer_name" label="客户姓名" required>
              <Input placeholder="请输入客户姓名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customer_phone"
              label="客户手机"
              rules={[
                {
                  required: true,
                  message: '请输入客户手机',
                },
                () => ({
                  validator(_, value) {
                    if (!value || /^1[3-9]\d{9}$/.test(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('请输入正确的手机号码'))
                  },
                }),
              ]}
            >
              <Input placeholder="请输入客户手机" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="可选精修张数" name="max_select_photos">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="加选单价" name="extra_photo_price">
              <InputNumber min={0} step={50} style={{ width: '100%' }} addonBefore="￥" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Divider>添加产品</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="套餐">
            <Flex gap={8}>
              <Select placeholder="选择套餐" style={{ flex: 1 }} disabled />
              <Button type="primary" icon={<PlusOutlined />} disabled />
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
