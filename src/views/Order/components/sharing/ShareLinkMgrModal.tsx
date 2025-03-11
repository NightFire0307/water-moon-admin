import { generateShareLink } from '@/apis/link.ts'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, message, Modal, Radio, Select, Space } from 'antd'
import dayjs from 'dayjs'
import { useReducer } from 'react'

interface ShareLinkMgrProps {
  open: boolean
  orderId: number
  onClose: () => void
}

interface ShareLinkMgrFormValues {
  expire: 'forever' | 'limited'
  access_limit: 'unlimited' | 'limited_times'
  link_password: 'random' | 'custom'
  custom_password?: string
}

interface ShareLinkInfoProps {
  linkInfo: { share_url: string, share_password: string }
}

async function copyToClipboard(text: string) {
  try {
    await window.navigator.clipboard.writeText(text)
    message.success('链接及密码已复制')
  }
  catch {
    message.error('复制失败')
  }
}

function ShareLinkInfo({ linkInfo }: ShareLinkInfoProps) {
  return (
    <>
      {linkInfo.share_url && (
        <>
          <Flex gap={8} style={{ color: '#1677ff', fontWeight: 600, fontSize: '16px', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleOutlined />
            <span>分享链接已生成</span>
          </Flex>
          <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
            <Input value={linkInfo.share_url} readOnly addonBefore="链接" />
            <Input value={linkInfo.share_password} readOnly addonBefore="密码" />
            <Button
              type="primary"
              style={{ width: '100%' }}
              onClick={() => copyToClipboard(`http://127.0.0.1:5173/share/init/?surl=${linkInfo.share_url}&pwd=${linkInfo.share_password}`)}
            >
              复制链接及密码
            </Button>
          </Space>
        </>
      )}
    </>
  )
}

interface State {
  customPassword: boolean
  limitedTimes: boolean
  limitedCount: boolean
  linkInfo: { share_url: string, share_password: string }
}

type Action =
  | { type: 'SET_CUSTOM_PASSWORD', payload: boolean }
  | { type: 'SET_LIMITED_TIMES', payload: boolean }
  | { type: 'SET_LIMITED_COUNT', payload: boolean }
  | { type: 'SET_LINK_INFO', payload: { share_url: string, share_password: string } }

const initialState = {
  customPassword: false,
  limitedTimes: false,
  limitedCount: false,
  linkInfo: { share_url: '', share_password: '' },
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'SET_CUSTOM_PASSWORD':
      return { ...state, customPassword: action.payload }
    case 'SET_LIMITED_TIMES':
      return { ...state, limitedTimes: action.payload }
    case 'SET_LIMITED_COUNT':
      return { ...state, limitedCount: action.payload }
    case 'SET_LINK_INFO':
      return { ...state, linkInfo: action.payload }
    default:
      return state
  }
}

export function ShareLinkMgrModal({ open, orderId, onClose }: ShareLinkMgrProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [form] = Form.useForm()
  const initialValues: ShareLinkMgrFormValues = {
    expire: 'forever',
    access_limit: 'unlimited',
    link_password: 'random',
  }

  const handleCreateLink = async () => {
    try {
      const values = form.getFieldsValue()
      // TODO 生成分享链接
      const { data } = await generateShareLink({
        order_id: orderId,
        expired_at: values.expire === 'forever' ? 0 : dayjs().add(values.custom_expire, 'day').unix(),
      })
      dispatch({ type: 'SET_LINK_INFO', payload: { share_url: data.share_url, share_password: data.share_password } })
    }
    catch {
      message.error('生成分享链接失败')
    }
  }

  return (
    <Modal
      title="分享链接"
      open={open}
      footer={null}
      onCancel={() => {
        form.resetFields()
        onClose()
      }}
    >
      {!state.linkInfo.share_url
        ? (
            <Form form={form} layout="horizontal" initialValues={initialValues}>
              <Form.Item name="expire" label="有效期">
                <Radio.Group onChange={e => dispatch({ type: 'SET_LIMITED_TIMES', payload: e.target.value === 'limited_times' })}>
                  <Radio value="forever">永久有效</Radio>
                  <Radio value="limited_times">限时有效</Radio>
                </Radio.Group>
              </Form.Item>
              {state.limitedTimes && (
                <Form.Item name="custom_expire">
                  <Radio.Group>
                    <Radio value={1}>1天</Radio>
                    <Radio value={7}>7天</Radio>
                    <Radio value={30}>30天</Radio>
                  </Radio.Group>
                </Form.Item>
              )}
              <Form.Item name="access_limit" label="访问限制">
                <Radio.Group onChange={e => dispatch({ type: 'SET_LIMITED_COUNT', payload: e.target.value === 'limited_count' })}>
                  <Radio value="unlimited">不限制</Radio>
                  <Radio value="limited_count">限制次数</Radio>
                </Radio.Group>
              </Form.Item>
              {state.limitedCount && (
                <Form.Item name="custom_access_limit" label="限制次数" wrapperCol={{ span: 6 }}>
                  <Select placeholder="请选择次数">
                    {Array.from({ length: 10 }, (_, i) => (
                      <Select.Option key={i + 1} value={i + 1}>
                        {i + 1}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
              <Form.Item name="link_password" label="链接密码">
                <Radio.Group onChange={e => dispatch({ type: 'SET_CUSTOM_PASSWORD', payload: e.target.value === 'custom' })}>
                  <Radio value="random">随机密码</Radio>
                  <Radio value="custom">自定义密码</Radio>
                </Radio.Group>
              </Form.Item>
              {state.customPassword && (
                <Form.Item name="custom_password" label="输入密码" wrapperCol={{ span: 8 }}>
                  <Input placeholder="请输入4-6位密码" minLength={4} maxLength={6} />
                </Form.Item>
              )}
              <Flex justify="flex-end">
                <Button type="primary" onClick={handleCreateLink}>创建链接</Button>
              </Flex>
            </Form>
          )
        : (
            <ShareLinkInfo linkInfo={state.linkInfo} />
          )}
    </Modal>
  )
}
