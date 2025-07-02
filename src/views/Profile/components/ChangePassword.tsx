import { SaveOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Row, Space } from 'antd'
import styles from './ChangePassword.module.less'

export function ChangePassword() {
  return (
    <div className={styles.changePwd}>

      <Card>
        <div className={styles.changePwdCard}>
          <h3 className={styles.changePwdCard__title}>修改密码</h3>
          <p className={styles.changePwdCard__desc}>定期修改密码以保证账户安全</p>
        </div>

        <Form layout="vertical">
          <Form.Item label="当前密码" name="currentPassword">
            <Input.Password placeholder="请输入原密码" />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="新密码" name="password">
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="确认新密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
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
        <div className={styles.changePwdFooter}>
          <Button icon={<SaveOutlined />} type="primary">保存更改</Button>
        </div>
      </Card>

    </div>
  )
}
