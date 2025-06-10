import { SaveOutlined } from '@ant-design/icons'
import { Button, DatePicker, Form, Input, Select } from 'antd'

export function BasicInfo() {
  return (
    <div style={{ padding: '24px' }}>
      <Form layout="vertical">
        <Form.Item label="昵称">
          <Input placeholder="请输入昵称" />
        </Form.Item>
        <Form.Item label="手机号">
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item label="所属角色">
          <Select />
        </Form.Item>
        <Form.Item label="最近登录时间">
          <DatePicker showTime />
        </Form.Item>
      </Form>
      <Button icon={<SaveOutlined />} type="primary">保存更改</Button>
    </div>
  )
}
