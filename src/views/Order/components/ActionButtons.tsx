import type { AnyObject } from 'antd/es/_util/type'
import IconEye from '@/assets/icons/eye.svg?react'
import IconImage from '@/assets/icons/image.svg?react'
import IconImages from '@/assets/icons/images.svg?react'
import IconLink from '@/assets/icons/link.svg?react'
import IconPencil from '@/assets/icons/pencil.svg?react'
import IconRotateCcw from '@/assets/icons/rotate-ccw.svg?react'
import IconTrash from '@/assets/icons/trash.svg?react'
import { type IOrder, OrderStatus } from '@/types/order.ts'
import { MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, message, Modal } from 'antd'

const { confirm } = Modal

export enum OrderAction {
  EDIT = 'edit',
  MANAGE_PHOTOS = 'manage_photos',
  MANAGE_LINKS = 'manage_links',
  VIEW_DETAIL = 'view_detail',
  VIEW_SELECT_RESULT = 'view_select_result',
  RESET = 'reset',
  DELETE = 'delete',
}

interface ActionButtonsProps {
  record: AnyObject
  onEdit: (record: AnyObject) => void
  onViewDetail: (record: AnyObject) => void
  onManagePhotos: (record: AnyObject) => void
  onManageLinks: (record: AnyObject) => void
  onResetStatus: (record: AnyObject) => void
  onViewSelectionResult: (record: AnyObject) => void
  onDelete: (record: AnyObject) => void
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
  } = props

  function handleMenuClick(key: OrderAction, record: AnyObject) {
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
            disabled: ![OrderStatus.SUBMITTED, OrderStatus.FINISHED].includes((record as IOrder).status),
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
            label: '链接管理',
            icon: <IconLink />,
          },
          {
            type: 'divider',
          },
          {
            key: OrderAction.RESET,
            label: '重置状态',
            icon: <IconRotateCcw />,
            disabled: [OrderStatus.NOT_STARTED, OrderStatus.CANCEL, OrderStatus.FINISHED].includes((record as IOrder).status),
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
