import type { IRole } from '@/types/role'
import type { IUser } from '@/types/user.ts'
import { getRoleList } from '@/apis/role.ts'
import { Col, Form, Input, message, Modal, Row, Select, Switch } from 'antd'
import { useEffect, useState } from 'react'

export interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: IUser
  onCreate?: (values: IUser) => void
  onUpdate?: (userId: number, values: IUser) => void
  onClose?: () => void
}

function UserFormModal(props: UserFormModalProps) {
  const { open, mode, onCreate, onUpdate, onClose, initialValues } = props
  const [options, setOptions] = useState<IRole[]>([])
  const [form] = Form.useForm()

  useEffect(() => {
    if (mode === 'edit' && initialValues) {
      // 提取Roles
      const roles = initialValues.roles.map(role => role.roleId)
      form.setFieldsValue({ ...initialValues, roles })
    }
  }, [open, initialValues])

  useEffect(() => {
    fetchRole()
  }, [])

  async function fetchRole() {
    const { data } = await getRoleList({})
    setOptions(data.list)
  }

  async function handleSubmit() {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      if (mode === 'create') {
        onCreate && onCreate(values)
      }
      else {
        if (!initialValues?.user_id) {
          message.error('用户ID不存在，无法更新')
          return
        }

        onUpdate && onUpdate(initialValues?.user_id, values)
      }
      handleCancel()
    }
    catch {
      message.error('请检查表单是否填写完整')
    }
  }

  function handleCancel() {
    form.resetFields()
    onClose && onClose()
  }

  return (
    <Modal
      open={open}
      title={mode === 'create' ? '新增用户' : '编辑用户'}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Form form={form} initialValues={{ isFrozen: false, isAdmin: false, roles: [] }}>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input placeholder="请输入用户名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nickname" label="昵称">
              <Input placeholder="请输入昵称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                {
                  pattern: /^1[3-9]\d{9}$/,
                  message: '请输入有效的11位手机号',
                },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Col>
        </Row>

        {
          mode === 'create' && (
            <Row gutter={8}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={
                    [
                      { required: true },
                      () => ({
                        validator(_, value) {
                          if (value.length < 6) {
                            return Promise.reject(new Error('密码不能少于6位'))
                          }

                          return Promise.resolve()
                        },
                      }),
                    ]
                  }
                >
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  rules={[
                    {
                      required: true,
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('两次密码输入不一致!'))
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="请再次输入密码" />
                </Form.Item>
              </Col>
            </Row>
          )
        }

        <Form.Item name="roles" label="用户角色">
          <Select options={options} placeholder="请选择角色" mode="multiple" fieldNames={{ label: 'name', value: 'roleId' }} />
        </Form.Item>

        <Row gutter={8}>
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
