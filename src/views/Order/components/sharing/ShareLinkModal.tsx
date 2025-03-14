import type { FC } from 'react'
import IconCopy from '@/assets/icons/copy.svg?react'
import IconSquareArrowOutUpRight from '@/assets/icons/square-arrow-out-up-right.svg?react'
import IconTrash from '@/assets/icons/trash.svg?react'
import { CustomBtn, CustomBtnGroup } from '@/components/CustomBtn'
import { LinkOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Flex, Modal, Row, Space, Tag, Typography } from 'antd'
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
            <CustomBtnGroup>
              <CustomBtn value={LinkAction.MY_LINKS} icon={<LinkOutlined />}>我的链接</CustomBtn>
              <CustomBtn value={LinkAction.CREATE_LINK} icon={<PlusOutlined />}>创建链接</CustomBtn>
            </CustomBtnGroup>
          </Space>
        </Col>
        <Col span={17} style={{ padding: '24px' }}>
          <Flex vertical gap={8}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>我的分享链接</Typography.Title>
            <Card size="small" hoverable style={{ cursor: 'auto' }}>
              <Flex justify="space-between">
                <Flex gap={8}>
                  <div className={styles.shareLink}>http://share.example.com/s/init?sur=abc123fefefefefefefefefefe</div>
                  <Button type="text" icon={<IconCopy width={16} height={16} />} shape="circle" />
                </Flex>
                <Flex align="center" gap={8}>
                  <Button type="text" icon={<IconSquareArrowOutUpRight width={16} height={16} />} shape="circle" />
                  <Button type="text" icon={<IconTrash width={16} height={16} />} shape="circle" danger />
                </Flex>
              </Flex>

              <Space style={{ marginTop: '6px' }}>
                <Tag style={{ borderRadius: '16px' }} color="blue">
                  <strong>密码: 123456</strong>
                </Tag>
                <Tag style={{ borderRadius: '16px' }} color="gold">7天内过期</Tag>
                <Tag style={{ borderRadius: '16px' }} color="green">永不过期</Tag>
                <Tag style={{ borderRadius: '16px' }}>5天前创建</Tag>
              </Space>
            </Card>

            <Card size="small" hoverable style={{ cursor: 'auto' }}>
              <Flex justify="space-between">
                <Flex gap={8}>
                  <div className={styles.shareLink}>http://share.example.com/s/init?sur=abc123fefefefefefefefefefe</div>
                  <Button type="text" icon={<IconCopy width={16} height={16} />} shape="circle" />
                </Flex>
                <Flex align="center" gap={8}>
                  <Button type="text" icon={<IconSquareArrowOutUpRight width={16} height={16} />} shape="circle" />
                  <Button type="text" icon={<IconTrash width={16} height={16} />} shape="circle" danger />
                </Flex>
              </Flex>

              <Space style={{ marginTop: '6px' }}>
                <Tag style={{ borderRadius: '16px' }} color="blue">
                  <strong>密码: 123456</strong>
                </Tag>
                <Tag style={{ borderRadius: '16px' }} color="gold">7天内过期</Tag>
                <Tag style={{ borderRadius: '16px' }} color="green">永不过期</Tag>
                <Tag style={{ borderRadius: '16px' }}>5天前创建</Tag>
              </Space>
            </Card>

            <Card size="small" hoverable style={{ cursor: 'auto' }}>
              <Flex justify="space-between">
                <Flex gap={8}>
                  <div className={styles.shareLink}>http://share.example.com/s/init?sur=abc123fefefefefefefefefefe</div>
                  <Button type="text" icon={<IconCopy width={16} height={16} />} shape="circle" />
                </Flex>
                <Flex align="center" gap={8}>
                  <Button type="text" icon={<IconSquareArrowOutUpRight width={16} height={16} />} shape="circle" />
                  <Button type="text" icon={<IconTrash width={16} height={16} />} shape="circle" danger />
                </Flex>
              </Flex>

              <Space style={{ marginTop: '6px' }}>
                <Tag style={{ borderRadius: '16px' }} color="blue">
                  <strong>密码: 123456</strong>
                </Tag>
                <Tag style={{ borderRadius: '16px' }} color="gold">7天内过期</Tag>
                <Tag style={{ borderRadius: '16px' }} color="green">永不过期</Tag>
                <Tag style={{ borderRadius: '16px' }}>5天前创建</Tag>
              </Space>
            </Card>
          </Flex>
        </Col>
      </Row>
    </Modal>
  )
}
