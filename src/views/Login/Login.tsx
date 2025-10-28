import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { throttle } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, refreshToken } from '@/apis/login.ts'
import { useUserInfo } from '@/store/useUserStore'
import styles from './Login.module.less'

export function Login() {
  const [loading, setLoading] = useState(false)
  const setAccessToken = useUserInfo(state => state.setAccessToken)
  const navigate = useNavigate()
  const [form] = useForm()

  const handleLogin = useCallback(throttle(async () => {
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
      const { accessToken } = data

      setAccessToken(accessToken)

      if (accessToken) {
        message.success('登录成功')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1000)
      }
    }
    catch (err) {
      console.error(err)
    }
    finally {
      setLoading(false)
    }
  }, 1000), [form])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault() // 阻止默认的表单提交行为
      handleLogin()
    }
  }

  useEffect(() => {
    refreshToken().then(async ({ data }) => {
      setAccessToken(data.accessToken)
      navigate('/dashboard')
    })
  }, [])

  return (
    <div className={styles.loginContainer} onKeyDown={handleKeyDown}>
      <Card className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>水月系统登录</h1>
        </div>
        <Form
          form={form}
          layout="vertical"
          className="login-form"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              prefix={<LockOutlined />}
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
