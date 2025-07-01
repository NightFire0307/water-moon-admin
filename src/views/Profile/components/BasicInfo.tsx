import { SaveOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Row, Select } from 'antd'
import styles from './BasicInfo.module.less'

export function BasicInfo() {
  return (
    <div className={styles.basicInfo}>
      <div className={styles.basicInfo__header}>
        <h2>个人资料</h2>
        <Button icon={<SaveOutlined />} type="primary">保存更改</Button>
      </div>
      <Card>
        <Form layout="vertical">
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item label="昵称" name="nickname">
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="所属角色">
            <Select />
          </Form.Item>
        </Form>
      </Card>

    </div>
  )
}
