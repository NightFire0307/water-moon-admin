import type { InputRef, TableProps } from 'antd'
import type { FC, PropsWithChildren, ReactNode } from 'react'
import IconTrash from '@/assets/icons/trash.svg?react'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Modal, Row, Select, Table } from 'antd'

import { useRef, useState } from 'react'

interface Item {
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
  const inputRef = useRef<InputRef>(null)

  const save = async () => {
    try {
      const value = inputRef.current?.input?.value
      handleSave({ ...record, [dataIndex]: value })
    }
    catch (errInfo) {
      console.log('Save failed:', errInfo)
    }
  }

  return (
    <td {...restProps}>
      {editable
        ? (
            <InputNumber
              defaultValue={record[dataIndex]}
              min={0}
              onPressEnter={save}
              onBlur={save}
            />
          )
        : (
            children
          )}
    </td>
  )
}

export function OrderModalForm() {
  const [dataSource, setDataSource] = useState<Item[]>([
    {
      key: 1,
      name: '套餐1',
      type: '套餐',
      count: 1,
    },
    {
      key: 2,
      name: '单品1',
      type: '单品',
      count: 2,
    },
  ])

  const handleSave = (row: Item) => {
    const newData = [...dataSource]
    const index = newData.findIndex(item => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })
    setDataSource(newData)
  }

  const columns: TableProps<Item>['columns'] = [
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
      render: () => (
        <Button type="text" icon={<IconTrash />} danger />
      ),
    },
  ]

  const components = {
    body: {
      cell: EditableCell,
    },
  }

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }

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

  return (
    <Modal open={true} title="创建订单" width={900}>
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="订单号" required>
              <Input placeholder="请输入订单号" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="客户姓名" required>
              <Input placeholder="请输入客户姓名" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
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
            <Form.Item label="可选精修张数">
              <InputNumber defaultValue={0} min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="超选单价">
              <InputNumber defaultValue={0} min={0} step={50} style={{ width: '100%' }} addonAfter="￥" />
            </Form.Item>
          </Col>
        </Row>
        <Divider>添加产品</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="添加套餐">
              <Flex gap={8}>
                <Select placeholder="选择套餐" style={{ flex: 1 }} />
                <Button type="primary" icon={<PlusOutlined />} />
              </Flex>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="添加单品">
              <Flex gap={8}>
                <Select placeholder="选择套餐" style={{ flex: 1 }} />
                <InputNumber min={1} defaultValue={1} />
                <Button type="primary" icon={<PlusOutlined />} />
              </Flex>
            </Card>
          </Col>
        </Row>
        <Divider>已添加产品</Divider>
        <Table
          columns={mergedColumns}
          dataSource={dataSource}
          components={components}
          bordered={false}
        />
      </Form>
    </Modal>
  )
}
