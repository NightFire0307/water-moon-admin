import type { ILink } from '@/types/link'
import { getShareLinksByOrderId } from '@/apis/link'
import { CustomBtnGroup } from '@/components/CustomBtn'
import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Col, Flex, Modal, Row, Space, Typography } from 'antd'
import { type FC, useEffect, useState } from 'react'
import { ShareLinkCard } from './ShareLinkCard'
import styles from './ShareLinkModal.module.less'

enum LinkAction {
  MY_LINKS = 'my_links',
  CREATE_LINK = 'create_link',
}

interface ShareLinkModalProps {
  open: boolean
  onClose?: () => void
}

export const ShareLinkModal: FC<ShareLinkModalProps> = ({ open, onClose }) => {
  const [links, setLinks] = useState<ILink[]>([])

  const fetchLinksByOrderId = async () => {
    const { data } = await getShareLinksByOrderId(35)
    setLinks(data)
  }

  useEffect(() => {
    if (open) {
      fetchLinksByOrderId()
    }
  }, [open])

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
              items={[
                { key: LinkAction.MY_LINKS, label: '我的链接', icon: <LinkOutlined />, children: '1' },
                { key: LinkAction.CREATE_LINK, label: '创建链接', icon: <PlusOutlined />, children: '2' },
              ]}
              onChange={value => console.log(value)}
            />
          </Space>
        </Col>
        <Col span={17} style={{ padding: '24px' }}>
          <Flex vertical gap={8}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>订单分享链接</Typography.Title>

            {links.map(link => (
              <ShareLinkCard key={link.id} data={link} />
            ))}
          </Flex>
        </Col>
      </Row>
    </Modal>
  )
}
