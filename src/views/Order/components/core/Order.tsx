import type { IOrder } from '@/types/order.ts'
import type { TableColumnProps } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import { getOrderDetailById, getOrderList, removeOrder } from '@/apis/order.ts'
import usePagination from '@/hooks/usePagination.ts'
import useTableSelection from '@/hooks/useTableSelection.ts'
import { useMinioUpload } from '@/store/useMinioUpload.tsx'
import { UploadStatus } from '@/store/useUploadFile.tsx'
import { OrderStatus } from '@/types/order.ts'
import { ActionButtons } from '@/views/Order/ActionButtons.tsx'
import { OrderDetail } from '@/views/Order/components/core/OrderDetail.tsx'
import { OrderModalForm } from '@/views/Order/components/forms/OrderModalForm.tsx'
import { OrderQueryForm } from '@/views/Order/components/forms/OrderQueryForm.tsx'
import { PhotoMgrModal } from '@/views/Order/PhotoMgrModal.tsx'
import { TaskCenter } from '@/views/Order/TaskCenter.tsx'
import { PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Flex, FloatButton, Table, Tag, Tooltip } from 'antd'
import { useEffect, useState } from 'react'
import { ShareLinkModal } from '../sharing/ShareLinkModal'

export function Order() {
  const [dataSource, setDataSource] = useState<IOrder[]>([])
  const [orderModal, setOrderModal] = useState<{ open: boolean, mode: 'create' | 'edit', initialValues?: AnyObject }>({
    open: false,
    mode: 'create',
    initialValues: {},
  })
  const [taskCenterOpen, setTaskCenterOpen] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [photoMgrOpen, setPhotoMgrOpen] = useState(false)
  const [shareLinkMgrOpen, setShareLinkMgrOpen] = useState(false)
  const [curOrderId, setCurOrderId] = useState<number>(-1)
  const [incompleteFileCount, setIncompleteFileCount] = useState(0)
  const { rowSelection } = useTableSelection({ type: 'checkbox' })
  const { pagination, current, pageSize, setTotal, reset } = usePagination()

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
        let color: string
        let text: string
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
    {
      title: '操作',
      dataIndex: 'action',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onEdit={async (record) => {
            setCurOrderId(record.id)
            const { data } = await getOrderDetailById(record.id)
            setOrderModal({ open: true, mode: 'edit', initialValues: data })
          }}
          onViewDetail={(record) => {
            setCurOrderId(record.id)
            setOrderDetailOpen(true)
          }}
          onManagePhotos={(record) => {
            setCurOrderId(record.id)
            setPhotoMgrOpen(true)
          }}
          onManageLinks={() => {
            setCurOrderId(record.id)
            setShareLinkMgrOpen(true)
          }}
          onResetStatus={() => {}}
          onViewSelectionResult={() => {}}
          onDelete={async (record) => {
            await removeOrder(record.id)
            fetchOrderList()
          }}
        />
      ),
    },
  ]

  async function fetchOrderList(current = pagination.current, pageSize = pagination.pageSize) {
    const { data } = await getOrderList({ current, pageSize })
    setDataSource(data.list)
    setTotal(data.total)
  }

  useEffect(() => {
    fetchOrderList()
  }, [current, pageSize])

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
      <OrderQueryForm
        onQuery={params => fetchOrderList(params)}
        onReset={() => {
          reset()
          fetchOrderList()
        }}
      />
      <Divider />
      <Flex justify="flex-end" gap={4}>
        <Button
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => {
            setOrderModal({ open: true, mode: 'create' })
          }}
        >
          新建订单
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
        rowSelection={rowSelection}
        pagination={pagination}
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
      <OrderModalForm
        open={orderModal.open}
        mode={orderModal.mode}
        initialValues={orderModal.initialValues}
        onClose={() => {
          setOrderModal({ open: false, mode: 'create' })
          fetchOrderList()
        }}
      />
      <TaskCenter open={taskCenterOpen} onClose={() => setTaskCenterOpen(false)} />
      <OrderDetail orderId={curOrderId} open={orderDetailOpen} onClose={() => setOrderDetailOpen(false)} />
      <PhotoMgrModal open={photoMgrOpen} orderId={curOrderId} onClose={() => setPhotoMgrOpen(false)} />
      <ShareLinkModal open={shareLinkMgrOpen} orderId={curOrderId} onClose={() => setShareLinkMgrOpen(false)}/>
    </>
  )
}
