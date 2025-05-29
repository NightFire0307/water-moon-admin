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
  const saveUserInfo = useUserInfo(state => state.saveUserInfo)
  const navigate = useNavigate()
  const [form] = useForm()

  async function handleLogin() {
    setLoading(true)
    const values = form.getFieldsValue()
    try {
      const { data } = await login(values)
      const { accessToken, userInfo } = data
      await saveToken(accessToken)
      await saveUserInfo(userInfo)

      if (accessToken) {
        message.success('登录成功')
        setTimeout(() => {
          navigate('/dashboard')
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
        <div className={styles.loginHeader}>
          <h1>管理后台</h1>
          <p className={styles.desc}>登录您的账户</p>
        </div>
        <Form
          form={form}
          layout="vertical"
          className="login-form"
          initialValues={{ username: 'admin', password: '123456' }}
        >
          <Form.Item
            label="用户名"
            name="username"
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="请输入密码"
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
