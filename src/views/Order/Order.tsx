import type { IOrder } from '@/types/order.ts'
import type { TableColumnProps } from 'antd'
import { getOrderList, removeOrder } from '@/apis/order.ts'
import { UploadStatus, useUploadFile } from '@/store/useUploadFile.tsx'
import { OrderStatus } from '@/types/order.ts'
import { OrderModalForm } from '@/views/Order/OrderModalForm.tsx'
import { OrderQueryForm } from '@/views/Order/OrderQueryForm.tsx'
import { TaskCenter } from '@/views/Order/TaskCenter.tsx'

import { MoreOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Dropdown, Flex, FloatButton, message, Modal, Space, Table, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

const { confirm } = Modal

enum OrderAction {
  VIEW_LINK = 'view_link',
  RESET = 'reset',
  DELETE = 'delete',
}

export function Order() {
  const [dataSource, setDataSource] = useState<IOrder[]>([])
  const [modalVisible, SetModalVisible] = useState(false)
  const [taskCenterOpen, setTaskCenterOpen] = useState(false)
  const [incompleteFileCount, setIncompleteFileCount] = useState(0)

  const columns: TableColumnProps[] = [
    {
      title: '订单号',
      dataIndex: 'order_number',
      render: value => <span style={{ fontWeight: '500' }}>{value}</span>,
    },
    { title: '客户', dataIndex: 'customer_name' },
    { title: '客户手机', dataIndex: 'customer_phone' },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (value) => {
        let status: 'success' | 'processing' | 'default' | 'error' | 'warning' = 'default'
        let text = ''
        switch (value) {
          case OrderStatus.NOT_STARTED:
            status = 'default'
            text = '选片未开始'
            break
          case OrderStatus.IN_PROGRESS:
            status = 'processing'
            text = '选片进行中'
            break
          case OrderStatus.SUBMITTED:
            status = 'success'
            text = '选片已完成'
            break
          case OrderStatus.EXPIRED:
            status = 'error'
            text = '链接已过期'
            break
          default:
            status = 'warning'
            text = '未知'
        }
        return <Badge status={status} text={text} />
      },
    },
    {
      title: '可选（张数）',
      dataIndex: 'max_select_photos',
      render: value => <span style={{ color: '#52c41a' }}>{value}</span>,
    },
    {
      title: '总共（张数）',
      dataIndex: 'total_photos',
      render: value => <span style={{ color: '#faad14' }}>{value}</span>,
    },
    {
      title: '链接状态',
      dataIndex: 'link_status',
      render: () => <Tag color="red">未生成</Tag>,
    },
    { title: '操作', dataIndex: 'action', render: (_, record) => (
      <Space>
        <a>详情</a>
        <a>照片管理</a>
        <Dropdown
          menu={{
            items: [
              {
                key: OrderAction.VIEW_LINK,
                label: '查看链接',
              },
              {
                key: OrderAction.RESET,
                label: '重置状态',
              },
              {
                key: OrderAction.DELETE,
                label: '删除',
                danger: true,
              },
            ],
            onClick: ({ key }) => {
              const id = (record as IOrder).id
              handleMenuClick(key, id)
            },
          }}
        >
          <a onClick={e => e.preventDefault()}>
            <MoreOutlined />
          </a>
        </Dropdown>
      </Space>
    ) },
  ]

  function handleMenuClick(key: string, id: number) {
    if (key === OrderAction.DELETE) {
      confirm({
        title: '您确定要删除这个订单吗？',
        content: '删除后无法恢复',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        centered: true,
        onOk() {
          return new Promise((resolve, reject) => {
            (async () => {
              try {
                const { code } = await removeOrder(id)
                if (code === 200) {
                  message.success('删除成功')
                  await fetchOrderList()
                  resolve(null)
                }
                else {
                  reject(new Error('删除失败'))
                }
              }
              catch {
                reject(new Error('删除失败'))
              }
            })()
          })
        },
      })
    }
  }

  function handleQuery(values: any) {
    console.log(values)
  }

  async function fetchOrderList() {
    const { data } = await getOrderList()
    setDataSource(data.list)
  }

  // function handleBeforeUnload(event: BeforeUnloadEvent) {
  //   console.log('beforeunload')
  //   event.preventDefault()
  //   confirm({
  //     title: '确定要离开吗？',
  //     content: '离开后未完成的操作将会丢失',
  //     okText: '确定',
  //     cancelText: '取消',
  //     onOk() {
  //       console.log('离开')
  //     },
  //     onCancel() {
  //       console.log('取消')
  //       event.preventDefault()
  //     },
  //   })
  // }

  useEffect(() => {
    fetchOrderList()
  }, [])

  useEffect(() => {
    const unsubscribe = useUploadFile.subscribe(
      state => state.uploadFiles,
      (uploadFiles) => {
        const count = uploadFiles.filter(file => file.status !== UploadStatus.Done).length
        setIncompleteFileCount(count)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <>
      <OrderQueryForm onQuery={handleQuery} onReset={() => fetchOrderList()} />
      <Divider />
      <Flex justify="flex-end" gap={4}>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => {
            SetModalVisible(true)
          }}
        >
          新 建
        </Button>
        <Tooltip title="刷新">
          <Button icon={<RedoOutlined rotate={-90} />} type="text" />
        </Tooltip>
      </Flex>
      <Table rowKey="id" dataSource={dataSource} columns={columns} style={{ marginTop: '14px' }} bordered />
      <OrderModalForm
        open={modalVisible}
        onCancel={() => {
          SetModalVisible(false)
          fetchOrderList()
        }}
      />

      {
        !taskCenterOpen && (
          <FloatButton
            shape="square"
            tooltip="任务中心"
            badge={{ count: incompleteFileCount, color: 'red' }}
            style={{ zIndex: 1001 }}
            onClick={() => setTaskCenterOpen(true)}
          />
        )
      }
      <TaskCenter open={taskCenterOpen} onClose={() => setTaskCenterOpen(false)} />
    </>
  )
}
