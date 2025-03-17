import type { ILink } from '@/types/link'
import IconCopy from '@/assets/icons/copy.svg?react'
import IconSquareArrowOutUpRight from '@/assets/icons/square-arrow-out-up-right.svg?react'
import IconTrash from '@/assets/icons/trash.svg?react'
import { Button, Card, Flex, message, Popconfirm, Space, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { type FC, useMemo } from 'react'
import styles from './ShareLinkCard.module.less'

interface ShareLinkCardProps {
  data: ILink
  onDelete: (linkId: number) => void
}

export const ShareLinkCard: FC<ShareLinkCardProps> = ({ data, onDelete }) => {
  const commonUrl = 'http://127.0.0.1:5173/share/init?surl='
  const { daysUntilExpiry, daysFromCreation } = useMemo(() => {
    const now = dayjs()

    // 计算创建天数
    const createDate = dayjs(data.created_at)
    const daysFromCreation = now.diff(createDate, 'day')

    // 计算过期天数（如果有过期时间）
    let daysUntilExpiry = 0
    if (data.expired_at) {
      const expireDate = dayjs(data.expired_at)
      daysUntilExpiry = expireDate.diff(now, 'day')
    }

    return { daysUntilExpiry, daysFromCreation }
  }, [data.created_at, data.expired_at])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commonUrl + data.share_url)
      message.success('复制成功')
    }
    catch (error) {
      console.error(error)
      message.error('复制失败, 请手动复制')
    }
  }

  return (
    <Card size="small" hoverable style={{ cursor: 'auto' }}>
      <Flex justify="space-between">
        <Flex gap={8}>
          <div className={styles.shareLink}>
            { data.share_url }
          </div>
          <Tooltip title="复制链接">
            <Button
              type="text"
              icon={<IconCopy width={16} height={16} />}
              shape="circle"
              onClick={handleCopy}
            />
          </Tooltip>
        </Flex>
        <Flex align="center" gap={8}>
          <Tooltip title="打开链接">
            <Button
              type="text"
              icon={<IconSquareArrowOutUpRight width={16} height={16} />}
              shape="circle"
              onClick={() => window.open(commonUrl + data.share_url)}
            />
          </Tooltip>
          <Tooltip title="删除链接">
            <Popconfirm title="确定要删除此链接吗?" onConfirm={() => onDelete(data.id)}>
              <Button
                type="text"
                icon={<IconTrash width={16} height={16} />}
                shape="circle"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Flex>
      </Flex>

      <Space style={{ marginTop: '6px' }}>
        <Tag style={{ borderRadius: '16px' }} color="blue">
          <strong>
            密码:
            {' '}
            { data.share_password }
          </strong>
        </Tag>
        {
          data.expired_at === null
            ? <Tag style={{ borderRadius: '16px' }} color="green">永不过期</Tag>
            : (
                <Tag style={{ borderRadius: '16px' }} color="gold">
                  {daysUntilExpiry}
                  天内过期
                </Tag>
              )
        }
        <Tag style={{ borderRadius: '16px' }}>
          {daysFromCreation === 0 ? '今天创建' : `${daysFromCreation}天前创建`}
        </Tag>
      </Space>
    </Card>
  )
}
