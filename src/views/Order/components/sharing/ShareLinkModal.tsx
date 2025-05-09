import type { ILink } from '@/types/link'
import { delShareLinkByOrderId, getShareLinksByOrderId } from '@/apis/link'
import { CustomBtnGroup } from '@/components/CustomBtn'
import { useOrderInfoContext } from '@/contexts/orderInfoContext'
import usePagination from '@/hooks/usePagination'
import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Col, Empty, Flex, message, Modal, Pagination, Row, Space, Typography } from 'antd'
import { type FC, useEffect, useState } from 'react'
import { ShareLinkCard } from './ShareLinkCard'
import { ShareLinkForm } from './ShareLinkForm'
import styles from './ShareLinkModal.module.less'

enum LinkAction {
  ORDER_LINKS = 'order_links',
  CREATE_LINK = 'create_link',
}

interface ShareLinkModalProps {
  open: boolean
  onClose?: () => void
}

export const ShareLinkModal: FC<ShareLinkModalProps> = ({ open, onClose }) => {
  const [selected, setSelected] = useState(LinkAction.ORDER_LINKS)
  const [links, setLinks] = useState<ILink[]>([])
  const { setTotal, pagination, current, pageSize } = usePagination({ defaultPageSize: 5 })
  const { id: orderId } = useOrderInfoContext()

  const fetchLinksByOrderId = async () => {
    if (orderId === null) {
      message.error('没有选中订单ID')
      return
    }
    const { data } = await getShareLinksByOrderId(orderId, { current, pageSize })
    setLinks(data.list)
    setTotal(data.total)
  }

  async function handleDeleteLink(linkId: number) {
    const { msg } = await delShareLinkByOrderId(linkId)
    message.success(msg)
    fetchLinksByOrderId()
  }

  useEffect(() => {
    if (open && selected === LinkAction.ORDER_LINKS) {
      fetchLinksByOrderId()
    }
  }, [open, current, pageSize, selected])

  return (
    <Modal
      open={open}
      footer={null}
      width={900}
      onCancel={onClose}
      styles={{ content: { padding: 0, overflow: 'hidden' } }}
    >
      <Row>
        <Col span={7} style={{ background: 'linear-gradient(#4096ff, #0958d9)', padding: '24px', color: 'white' }}>
          <Flex align="center" gap={16} style={{ marginBottom: 24, fontSize: 20, fontWeight: 600 }}>
            <div className={styles['icon-wrapper']}>
              <LinkOutlined />
            </div>
            <div>链接管理</div>
          </Flex>

          <Space direction="vertical" style={{ width: '100%' }}>
            <CustomBtnGroup
              activeKey={selected}
              items={[
                { key: LinkAction.ORDER_LINKS, label: '订单链接', icon: <LinkOutlined />, children: '1' },
                { key: LinkAction.CREATE_LINK, label: '创建链接', icon: <PlusOutlined />, children: '2' },
              ]}
              onChange={value => setSelected(value)}
            />
          </Space>
        </Col>
        <Col span={17} style={{ padding: '24px' }}>
          <Flex vertical gap={8}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {
                selected === LinkAction.ORDER_LINKS ? '订单链接' : '创建链接'
              }
            </Typography.Title>
            {
              selected === LinkAction.ORDER_LINKS && (
                <>
                  {
                    links.length > 0
                      ? (
                          <>
                            {
                              links.map(link => (
                                <ShareLinkCard key={link.id} data={link} onDelete={handleDeleteLink} />
                              ))
                            }
                            <Pagination align="end" {...pagination} />
                          </>
                        )
                      : <Empty description="暂无数据" />
                  }
                </>
              )
            }

            {
              selected === LinkAction.CREATE_LINK && (
                <ShareLinkForm onCreateLink={() => {
                  setSelected(LinkAction.ORDER_LINKS)
                }}
                />
              )
            }
          </Flex>
        </Col>
      </Row>
    </Modal>
  )
}
