import { generateShareLink } from '@/apis/link'
import { useOrderInfoContext } from '@/contexts/OrderInfoContext'
import { Button, Form, Input, message, Radio } from 'antd'
import dayjs from 'dayjs'
import { type FC, useState } from 'react'

enum PasswordType {
  RANDOM = 'random',
  CUSTOM = 'custom',
}

interface ShareLinkFormProps {
  onCreateLink: () => void
}

export const ShareLinkForm: FC<ShareLinkFormProps> = ({ onCreateLink }) => {
  const [passwordType, setPasswordType] = useState<PasswordType>(PasswordType.RANDOM)
  const [form] = Form.useForm()
  const { id: orderId } = useOrderInfoContext()

  const handleGenerateShareLink = async () => {
    if (!orderId)
      return

    const values = form.getFieldsValue()

    const expired = values.expired
    const { msg } = await generateShareLink({
      order_id: orderId,
      expired_at: expired === undefined ? undefined : dayjs().add(expired, 'day').unix(),
      password: values.passwordType === PasswordType.RANDOM ? undefined : values.customPassword,
    })
    message.success(msg)
    onCreateLink && onCreateLink()
    form.resetFields()
  }

  return (
    <Form form={form} initialValues={{ expired: undefined, passwordType: PasswordType.RANDOM }}>
      <Form.Item name="expired" label="链接有效期">
        <Radio.Group options={[
          { label: '永久', value: undefined },
          { label: '7天', value: 7 },
          { label: '30天', value: 30 },
          { label: '60天', value: 60 },
        ]}
        />
      </Form.Item>
      <Form.Item label="链接密码">
        <Form.Item name="passwordType" style={{ display: 'inline-block' }}>
          <Radio.Group
            options={[
              { label: '随机密码', value: PasswordType.RANDOM },
              { label: '自定义密码', value: PasswordType.CUSTOM },
            ]}
            onChange={e => setPasswordType(e.target.value)}
          />
        </Form.Item>

        {
          passwordType === PasswordType.CUSTOM && (
            <Form.Item name="customPassword" style={{ display: 'inline-block' }} required>
              <Input type="password" min={4} max={6} placeholder="请输入4-6位密码" />
            </Form.Item>
          )
        }
      </Form.Item>

      <Form.Item>
        <Button type="primary" onClick={handleGenerateShareLink}>生成新链接</Button>
      </Form.Item>
    </Form>
  )
}
