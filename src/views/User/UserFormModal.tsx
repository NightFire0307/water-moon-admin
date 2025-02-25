import type { IUser } from '@/types/user.ts'
import { Col, Form, Input, Modal, Row, Select, Switch } from 'antd'
import { useEffect } from 'react'

export interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: IUser
  onClose: () => void
}

function UserFormModal(props: UserFormModalProps) {
  const { open, mode, onClose, initialValues } = props
  const [form] = Form.useForm()

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      form.setFieldsValue(initialValues)
    }
  }, [open, initialValues])

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  return (
    <Modal open={open} title={mode === 'create' ? '新增用户' : '编辑用户'} onCancel={handleCancel}>
      <Form form={form}>
        <Row gutter={8}>
          <Col>
            <Form.Item name="username" label="用户名">
              <Input placeholder="请输入用户名" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="phone" label="手机号">
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col>
            <Form.Item name="password" label="密码">
              <Input placeholder="请输入密码" />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="confirmPassword" label="确认密码">
              <Input placeholder="请再次输入密码" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="roles" label="用户角色">
          <Select placeholder="请选择角色" mode="multiple" />
        </Form.Item>

        <Row gutter={8}>
          <Col>
            <Form.Item name="isAdmin" label="是否管理员">
              <Switch />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="isFrozen" label="是否冻结">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default UserFormModal
