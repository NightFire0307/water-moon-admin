import { login } from '@/apis/login.ts'
import { useUserInfo } from '@/store/useUserInfo.tsx'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
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

    // 校验表单
    try {
      await form.validateFields()
    }
    catch {
      setLoading(false)
      return
    }

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

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault() // 阻止默认的表单提交行为
      handleLogin()
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
          requiredMark={false}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
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
