import type { FC } from 'react'
import { Form, Modal, Input } from 'antd'
import PermissionTreeSelect from './components/PermissionTreeSelect'

export interface RoleFormModalProps {
  mode: 'create' | 'edit'
  open: boolean
  onClose?: () => void
}

const RoleFormModal: FC<RoleFormModalProps> = ({ open, mode, onClose }) => {
  const handleCancel = () => {
    onClose && onClose()
  }

  return (
    <Modal
      title={mode === 'create' ? '创建角色' : '编辑角色'}
      open={open}
      onCancel={handleCancel}
    >
      <Form>
        <Form.Item>
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
          >
            <Input.TextArea placeholder="请输入角色描述" />
          </Form.Item>
          <Form.Item name="permissions" label="角色权限">
            <PermissionTreeSelect />
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RoleFormModal
