import { login } from '@/apis/login.ts'
import { useUserInfo } from '@/store/useUserInfo.tsx'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.less'

export function Login() {
  const [loading, setLoading] = useState(false)
  const saveToken = useUserInfo(state => state.saveToken)
  const navigate = useNavigate()
  const [form] = useForm()

  async function handleLogin() {
    setLoading(true)
    const values = form.getFieldsValue()
    try {
      const { data } = await login(values)
      const { accessToken, refreshToken } = data
      await saveToken(accessToken, refreshToken)

      if (accessToken && refreshToken) {
        message.success('登录成功')
        setTimeout(() => {
          navigate('/')
        }, 1000)
      }
    }
    catch {
      message.error('登录失败')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <Form
          form={form}
          className="login-form"
          initialValues={{ username: 'admin', password: '123456' }}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入您的用户名！' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入您的密码！' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button loading={loading} type="primary" className={styles.loginFormButton} onClick={handleLogin}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
