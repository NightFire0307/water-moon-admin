import type { TableColumnProps } from 'antd'
import type { AnyObject } from 'antd/es/_util/type'
import { getOrderDetailById, getOrderList, removeOrder, resetOrderStatus } from '@/apis/order.ts'
import { OrderInfoContext } from '@/contexts/OrderInfoContext'
import { useFetch } from '@/hooks/useFetch'
import usePagination from '@/hooks/usePagination.ts'
import useTableSelection from '@/hooks/useTableSelection.ts'
import { useMinioUpload } from '@/store/useMinioUpload.tsx'
import { UploadStatus } from '@/store/useUploadFile.tsx'
import { type IOrder, OrderStatus } from '@/types/order.ts'
import { ActionButtons } from '@/views/Order/components/ActionButtons'
import { OrderModalForm } from '@/views/Order/components/forms/OrderModalForm.tsx'
import { OrderQueryForm } from '@/views/Order/components/forms/OrderQueryForm.tsx'
import { OrderDetail } from '@/views/Order/components/OrderDetail'
import { PhotoMgrModal } from '@/views/Order/components/PhotoMgrModal'
import { TaskCenter } from '@/views/Order/components/TaskCenter'
import { ExclamationCircleOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Checkbox, Divider, Flex, FloatButton, message, Modal, Table, Tag, Tooltip } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { PDFViewer } from '../../components/PdfExport/PdfViewer'
import PhotoReviewResult from './components/PhotoReviewResult'
import { ShareLinkModal } from './components/sharing/ShareLinkModal'

const { confirm } = Modal

export function Order() {
  const [orderModal, setOrderModal] = useState<{ open: boolean, mode: 'create' | 'edit', initialValues?: AnyObject }>({
    open: false,
    mode: 'create',
    initialValues: {},
  })
  const [taskCenterOpen, setTaskCenterOpen] = useState(false)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)
  const [photoMgrOpen, setPhotoMgrOpen] = useState(false)
  const [shareLinkMgrOpen, setShareLinkMgrOpen] = useState(false)
  const [photoReviewOpen, setPhotoReviewOpen] = useState(false)
  const [pdfExportOpen, setPdfExportOpen] = useState(false)
  const [curOrderInfo, setCurOrderInfo] = useState<IOrder>({} as IOrder)
  const [incompleteFileCount, setIncompleteFileCount] = useState(0)
  const resetSelection = useRef<boolean>(false)
  const { rowSelection } = useTableSelection({ type: 'checkbox' })
  const { pagination, current, pageSize, setTotal, reset } = usePagination()
  const { data, loading, refetch } = useFetch(
    getOrderList,
    {
      manual: true,
      params: [
        { current, pageSize },
      ],
      onSuccess: (data) => {
        setTotal(data.total)
      },
    },
  )
  const uploadQueue = useMinioUpload(state => state.uploadQueue)

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
            text = '选片已提交'
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
            setCurOrderInfo(record as IOrder)
            const { data } = await getOrderDetailById(record.id)
            setOrderModal({ open: true, mode: 'edit', initialValues: data })
          }}
          onViewDetail={(record) => {
            setCurOrderInfo(record as IOrder)
            setOrderDetailOpen(true)
          }}
          onManagePhotos={(record) => {
            setCurOrderInfo(record as IOrder)
            setPhotoMgrOpen(true)
          }}
          onManageLinks={() => {
            setCurOrderInfo(record as IOrder)
            setShareLinkMgrOpen(true)
          }}
          onResetStatus={() => {
            confirm({
              title: '是否要重置当前订单状态?',
              icon: <ExclamationCircleOutlined />,
              centered: true,
              content: <Checkbox onChange={e => resetSelection.current = e.target.checked}>重置所有选片结果</Checkbox>,
              async onOk() {
                await resetOrderStatus(record.id, { resetSelection: resetSelection.current })
                message.success('重置成功')
                refetch()
              },
              onCancel() {
                message.info('重置操作已取消')
              },
              onClose() {
                resetSelection.current = false
              },
            })
          }}
          onViewSelectionResult={() => {
            setCurOrderInfo(record as IOrder)
            setPhotoReviewOpen(true)
          }}
          onDelete={async (record) => {
            await removeOrder(record.id)
            refetch()
          }}
          onExportPdf={() => {
            setPdfExportOpen(true)
          }}
        />
      ),
    },
  ]

  useEffect(() => {
    refetch()
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
    <div style={{ padding: '24px' }}>
      <OrderQueryForm
        onQuery={params => refetch(params)}
        onReset={() => {
          reset()
        }}
      />
      <Divider />
      <Flex justify="space-between" gap={4}>
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
          <Button icon={<RedoOutlined rotate={-90} />} type="text" onClick={refetch} />
        </Tooltip>
      </Flex>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data?.list}
        columns={columns}
        style={{ marginTop: '14px' }}
        rowSelection={rowSelection}
        pagination={pagination}
      />

      {
        uploadQueue.length > 0 && (
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
          refetch()
        }}
      />

      <OrderInfoContext.Provider value={curOrderInfo}>
        <TaskCenter open={taskCenterOpen} onClose={() => setTaskCenterOpen(false)} />
        <OrderDetail open={orderDetailOpen} onClose={() => setOrderDetailOpen(false)} />
        <PhotoMgrModal open={photoMgrOpen} onClose={() => setPhotoMgrOpen(false)} />
        <ShareLinkModal open={shareLinkMgrOpen} onClose={() => setShareLinkMgrOpen(false)} />
        <PhotoReviewResult open={photoReviewOpen} onClose={() => setPhotoReviewOpen(false)} />
        <PDFViewer open={pdfExportOpen} onClose={() => setPdfExportOpen(false)} />
      </OrderInfoContext.Provider>
    </div>
  )
}
