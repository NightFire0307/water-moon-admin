import { FileDoneOutlined, FilePdfOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, message, Modal } from 'antd'
import { updateOrderStatus } from '@/apis/order'
import IconEye from '@/assets/icons/eye.svg?react'
import IconImage from '@/assets/icons/image.svg?react'
import IconImages from '@/assets/icons/images.svg?react'
import IconLink from '@/assets/icons/link.svg?react'
import IconPencil from '@/assets/icons/pencil.svg?react'
import IconRotateCcw from '@/assets/icons/rotate-ccw.svg?react'
import IconTrash from '@/assets/icons/trash.svg?react'
import { type IOrder, OrderStatus } from '@/types/order.ts'

const { confirm } = Modal

export enum OrderAction {
  EDIT = 'edit',
  MANAGE_PHOTOS = 'manage_photos',
  MANAGE_LINKS = 'manage_links',
  VIEW_DETAIL = 'view_detail',
  VIEW_SELECT_RESULT = 'view_select_result',
  RESET = 'reset',
  DELETE = 'delete',
  EXPORT_PDF = 'export_pdf',
  CONFIRM = 'confirm',
}

interface ActionButtonsProps {
  record: IOrder
  onEdit: (record: IOrder) => void
  onViewDetail: (record: IOrder) => void
  onManagePhotos: (record: IOrder) => void
  onManageLinks: (record: IOrder) => void
  onResetStatus: (record: IOrder) => void
  onViewSelectionResult: (record: IOrder) => void
  onDelete: (record: IOrder) => void
  onExportPdf: (record: IOrder) => void
  onConfirm: (record: IOrder) => void
}

export function ActionButtons(props: ActionButtonsProps) {
  const {
    record,
    onEdit,
    onViewDetail,
    onManagePhotos,
    onManageLinks,
    onResetStatus,
    onViewSelectionResult,
    onDelete,
    onExportPdf,
    onConfirm,
  } = props

  const status = (record as IOrder).status

  function handleMenuClick(key: OrderAction, record: IOrder) {
    switch (key) {
      case OrderAction.EDIT:
        onEdit(record)
        break
      case OrderAction.VIEW_DETAIL:
        onViewDetail(record)
        break
      case OrderAction.MANAGE_PHOTOS:
        onManagePhotos(record)
        break
      case OrderAction.MANAGE_LINKS:
        onManageLinks(record)
        break
      case OrderAction.RESET:
        onResetStatus(record)
        break
      case OrderAction.VIEW_SELECT_RESULT:
        onViewSelectionResult(record)
        break
      case OrderAction.DELETE:
        confirm({
          title: '删除订单',
          content: '订单删除后将无法恢复，请谨慎操作！',
          onOk: () => onDelete(record),
          onCancel: () => {
            message.info('已取消删除')
          },
        })
        break
      case OrderAction.EXPORT_PDF:
        onExportPdf(record)
        break
      case OrderAction.CONFIRM:
        confirm({
          title: '确认完成订单',
          content: '确认完成后，订单状态将变更为已完成，且不可修改！',
          onOk: async () => {
            await updateOrderStatus(record.id, OrderStatus.FINISHED)
            onConfirm(record)
            message.success('订单已确认完成')
          },
          onCancel: () => {
            message.info('已取消操作')
          },
        })
        break
      default:
        break
    }
  }

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          {
            key: OrderAction.EDIT,
            label: '修改订单',
            icon: <IconPencil />,
          },
          {
            key: OrderAction.VIEW_DETAIL,
            label: '查看详情',
            icon: <IconEye />,
          },
          {
            key: OrderAction.VIEW_SELECT_RESULT,
            label: '查看选片结果',
            icon: <IconImage />,
            disabled: ![OrderStatus.SUBMITTED, OrderStatus.FINISHED].includes(status),
          },
          {
            key: OrderAction.EXPORT_PDF,
            label: '导出PDF',
            icon: <FilePdfOutlined />,
            disabled: ![OrderStatus.SUBMITTED, OrderStatus.FINISHED].includes(status),
          },
          {
            type: 'divider',
          },
          {
            key: OrderAction.MANAGE_PHOTOS,
            label: '照片管理',
            icon: <IconImages />,
          },
          {
            key: OrderAction.MANAGE_LINKS,
            label: '链接管理(暂不可用)',
            icon: <IconLink />,
            disabled: true,
          },
          {
            type: 'divider',
          },
          {
            key: OrderAction.CONFIRM,
            label: '确认完成',
            icon: <FileDoneOutlined />,
            disabled: status !== OrderStatus.SUBMITTED,
          },
          {
            key: OrderAction.RESET,
            label: '重置状态',
            icon: <IconRotateCcw />,
            disabled: [OrderStatus.PENDING, OrderStatus.CANCEL, OrderStatus.FINISHED].includes(status),
          },
          {
            key: OrderAction.DELETE,
            label: '删除',
            icon: <IconTrash />,
            danger: true,
          },
        ],
        onClick: ({ key }) => handleMenuClick(key as OrderAction, record),
      }}
    >
      <Button type="text" icon={<MoreOutlined />} />
    </Dropdown>
  )
}
