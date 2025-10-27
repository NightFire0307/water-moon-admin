import { ExclamationCircleOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { Badge, Button, Checkbox, message, Modal, Space, Table, type TableColumnProps, Tag } from 'antd'
import { SearchIcon } from 'lucide-react'
import { useEffect } from 'react'
import { getOrderDetailById, getOrderList, removeOrder, resetOrderStatus } from '@/apis/order'
import { PageCard } from '@/components/PageCard'
import { useFetch } from '@/hooks/useFetch'
import usePagination from '@/hooks/usePagination'
import useTableSelection from '@/hooks/useTableSelection'
import { type IOrder, OrderStatus } from '@/types/order'
import { ActionButtons } from './OrderTableActions'

const { confirm } = Modal

interface OrderTableProps {
  searchOpen?: boolean
  handleSearch?: () => void
}

export function OrderTable({ searchOpen, handleSearch }: OrderTableProps) {
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

  const columns: TableColumnProps[] = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      render: value => <span style={{ fontWeight: '500' }}>{value}</span>,
    },
    { title: '客户', dataIndex: 'customerName' },
    { title: '客户手机', dataIndex: 'customerPhone' },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (value) => {
        let status: 'default' | 'processing' = 'default'
        let color: string
        let text: string
        switch (value) {
          case OrderStatus.PENDING:
            color = 'blue'
            text = '待选片'
            break
          case OrderStatus.PRE_SELECT:
            status = 'processing'
            color = 'gold'
            text = '预选阶段'
            break
          case OrderStatus.PRODUCT_SELECT:
            status = 'processing'
            color = 'purple'
            text = '产品选片阶段'
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
      dataIndex: 'maxSelectPhotos',
      render: value => <span style={{ color: '#52c41a' }}>{value}</span>,
    },
    {
      title: '总共（张数）',
      dataIndex: 'totalPhotos',
      render: value => <span style={{ color: '#faad14' }}>{value}</span>,
    },
    {
      title: '链接状态',
      dataIndex: 'linkStatus',
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
          }}
          onResetStatus={() => {
            confirm({
              title: '是否要重置当前订单状态?',
              icon: <ExclamationCircleOutlined />,
              centered: true,
              content: <Checkbox onChange={e => resetSelection.current = e.target.checked}>重置所有选片结果</Checkbox>,
              async onOk() {
                await resetOrderStatus(record.id, { reset: resetSelection.current })
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
            setCurOrderInfo(record as IOrder)
            setPdfExportOpen(true)
          }}
          onConfirm={async () => {
            await refetch()
          }}
        />
      ),
    },
  ]

  useEffect(() => {
    refetch()
  }, [current, pageSize])

  return (
    <PageCard
      title="订单列表"
      extra={(
        <Space>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              // setOrderModal({ open: true, mode: 'create' })
            }}
          >
            新增订单
          </Button>
          <Button type={searchOpen ? 'primary' : 'default'} icon={<SearchIcon size={16} />} shape="circle" onClick={handleSearch} />
          <Button icon={<RedoOutlined rotate={-90} />} shape="circle" onClick={refetch} />
        </Space>
      )}
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data?.list}
        columns={columns}
        style={{ marginTop: '14px' }}
        rowSelection={rowSelection}
        pagination={pagination}
      />
    </PageCard>
  )
}
