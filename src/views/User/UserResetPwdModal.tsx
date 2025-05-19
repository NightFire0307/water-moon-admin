import { Col, Form, Input, Modal, Row } from 'antd'

export interface UserResetPwdModalProps {
  userId: number
  open: boolean
  onClose: () => void
  onReset: (values: { password: string, confirmPassword: string, userId: number }) => void
}

function UserResetPwdModal(props: UserResetPwdModalProps) {
  const { open, onClose, onReset, userId } = props
  const [form] = Form.useForm()

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  function handleOk() {
    form.validateFields().then((values) => {
      onReset({ ...values, userId })
      form.resetFields()
    })
  }

  return (
    <Modal open={open} title="重置密码" onCancel={handleCancel} onOk={handleOk}>
      <Form form={form}>
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item
              name="password"
              label="新密码"
              rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码长度至少为6位' }]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认新密码' },
                { min: 6, message: '密码长度至少为6位' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UserResetPwdModal
