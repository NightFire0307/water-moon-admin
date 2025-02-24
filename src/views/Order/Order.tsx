import type { Pagination } from '@/types/common.ts'
import type { IOrder } from '@/types/order.ts'
import type { TableColumnProps } from 'antd'
import { getOrderList, removeOrder, resetOrderStatus } from '@/apis/order.ts'
import { useMinioUpload } from '@/store/useMinioUpload.tsx'
import { UploadStatus } from '@/store/useUploadFile.tsx'
import { OrderStatus } from '@/types/order.ts'
import { OrderDetail } from '@/views/Order/OrderDetail.tsx'
import { OrderModalForm } from '@/views/Order/OrderModalForm.tsx'
import { OrderQueryForm } from '@/views/Order/OrderQueryForm.tsx'
import { PhotoMgr } from '@/views/Order/PhotoMgr.tsx'
import { TaskCenter } from '@/views/Order/TaskCenter.tsx'
import { MoreOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Dropdown, Flex, FloatButton, message, Modal, Space, Table, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const { confirm } = Modal

enum OrderAction {
  VIEW_LINK = 'view_link',
  RESET = 'reset',
  DELETE = 'delete',
  VIEW_SELECT_RESULT = 'view_select_result',
}

export interface ISelectOrder {
  orderId: number
  orderNumber: string
}

export function Order() {
  const [dataSource, setDataSource] = useState<IOrder[]>([])
  const [pageInfo, setPageInfo] = useState<Pagination>({
    pageSize: 10,
    current: 1,
    total: 0,
  })
  const [modalVisible, SetModalVisible] = useState(false)
  const [taskCenterOpen, setTaskCenterOpen] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [photoMgrOpen, setPhotoMgrOpen] = useState(false)
  const [selectOrder, setSelectOrder] = useState<ISelectOrder>({
    orderId: 0,
    orderNumber: '',
  })
  const [incompleteFileCount, setIncompleteFileCount] = useState(0)
  const navigate = useNavigate()

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
        let status: 'default' | 'processing' = 'default'
        let color = 'gray'
        let text = ''
        switch (value) {
          case OrderStatus.NOT_STARTED:
            color = 'blue'
            text = '待选片'
            break
          case OrderStatus.IN_PROGRESS:
            status = 'processing'
            color = 'gold'
            text = '选片中'
            break
          case OrderStatus.SUBMITTED:
            color = 'orange'
            text = '选片完成'
            break
          case OrderStatus.CANCEL:
            color = 'gray'
            text = '订单取消'
            break
          case OrderStatus.FINISHED:
            color = 'green'
            text = '订单完成'
            break
          default:
            color = 'warning'
            text = '未知'
        }
        return <Badge status={status} color={color} text={text} />
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
      render: value => <Tag color={value ? 'green' : 'red'}>{ value ? '已生成' : '未生成'}</Tag>,
    },
    { title: '操作', dataIndex: 'action', render: (_, record) => (
      <Space>
        <a onClick={() => {
          const { id, order_number } = record as IOrder
          setSelectOrder({ orderId: id, orderNumber: order_number })
          setOrderDetailOpen(true)
        }}
        >
          详情
        </a>
        <a onClick={(e) => {
          e.preventDefault()
          const { id, order_number } = record as IOrder
          setSelectOrder({ orderId: id, orderNumber: order_number })
          setPhotoMgrOpen(true)
        }}
        >
          照片管理
        </a>
        <Dropdown
          menu={{
            items: [
              {
                key: OrderAction.VIEW_LINK,
                label: '链接管理',
              },
              {
                key: OrderAction.RESET,
                label: '重置状态',
                disabled: [OrderStatus.NOT_STARTED, OrderStatus.CANCEL, OrderStatus.FINISHED].includes((record as IOrder).status),
              },
              {
                key: OrderAction.VIEW_SELECT_RESULT,
                label: '查看选片结果',
                disabled: ![OrderStatus.SUBMITTED, OrderStatus.FINISHED].includes((record as IOrder).status),
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
    switch (key) {
      case OrderAction.DELETE:
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
        break
      case OrderAction.RESET:
        confirm({
          title: '您确定要重置这个订单吗？',
          content: (
            <div>

              {' '}
              <strong>待选片</strong>
            </div>
          ),
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          centered: true,
          onOk() {
            return new Promise((resolve, reject) => {
              (async () => {
                try {
                  const { msg } = await resetOrderStatus(id, { status: 0 })
                  message.success(msg)
                  resolve(null)
                }
                catch (e) {
                  reject(new Error('重置失败'))
                }
              })()
            })
          },
        })
        break
      case OrderAction.VIEW_SELECT_RESULT:
        navigate(`/selection/${id}`)
        break
      default:
        break
    }
  }

  async function fetchOrderList(params = {}) {
    const { data } = await getOrderList(params)
    setDataSource(data.list)
    setPageInfo({
      pageSize: data.pageSize,
      current: data.current,
      total: data.total,
    })
  }

  useEffect(() => {
    fetchOrderList()
  }, [])

  useEffect(() => {
    const unsubscribe = useMinioUpload.subscribe(
      state => state.uploadQueue,
      (uploadFiles) => {
        const count = uploadFiles.filter(file => file.status !== UploadStatus.Done).length
        setIncompleteFileCount(count)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <>
      <OrderQueryForm onQuery={params => fetchOrderList(params)} onReset={() => fetchOrderList()} />
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
          <Button icon={<RedoOutlined rotate={-90} />} type="text" onClick={() => fetchOrderList()} />
        </Tooltip>
      </Flex>
      <Table
        rowKey="id"
        dataSource={dataSource}
        columns={columns}
        style={{ marginTop: '14px' }}
        pagination={{
          ...pageInfo,
          onChange: (current, pageSize) => fetchOrderList({ current, pageSize }),
        }}
        bordered
      />
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
      <OrderDetail selectOrder={selectOrder} open={orderDetailOpen} onClose={() => setOrderDetailOpen(false)} />
      <PhotoMgr open={photoMgrOpen} selectOrder={selectOrder} onClose={() => setPhotoMgrOpen(false)} />
    </>
  )
}
