import type { IPermission } from '@/types/permissions'
import { getPermissions } from '@/apis/permissions'
import { useFetch } from '@/hooks/useFetch'
import { Form, Input, Modal, Tree, type TreeDataNode, type TreeProps } from 'antd'
import { type FC, useEffect, useState } from 'react'

export interface RoleFormModalProps {
  mode: 'create' | 'edit'
  open: boolean
  initValues?: any
  onCreate?: (values: any) => void
  onEdit?: (roleId: number, values: any) => void
  onClose?: () => void
}

const RoleFormModal: FC<RoleFormModalProps> = ({ open, mode, initValues, onCreate, onEdit, onClose }) => {
  const { data } = useFetch(getPermissions)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])
  const [form] = Form.useForm()

  const handleCancel = () => {
    onClose && onClose()
    setCheckedKeys([])
  }

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    console.log('selected', selectedKeys, info)
  }

  function transformData(data: IPermission[]) {
    const treeData: TreeDataNode[] = []

    data.forEach((item) => {
      const { id, name, children } = item
      const treeNode: TreeDataNode = {
        key: String(id),
        title: name,
      }

      if (children && children.length > 0) {
        treeNode.children = transformData(children)
      }

      treeData.push(treeNode)
    })

    return treeData
  }

  function handleSubmit() {
    const values = form.getFieldsValue()
    if (mode === 'create') {
      onCreate && onCreate({
        ...values,
        permissionIds: checkedKeys.map(key => Number(key)),
      })
    }

    if (mode === 'edit') {
      onEdit && onEdit(initValues?.role_id, {
        ...values,
        permissionIds: checkedKeys.map(key => Number(key)),
      })
    }
  }

  useEffect(() => {
    if (open) {
      const transData = transformData(data || [])
      setTreeData(transData)

      if (mode === 'edit') {
        form.setFieldsValue(initValues)
        setCheckedKeys(initValues.permissionIds.map((id: number) => String(id)))
      }
    }
  }, [open, initValues])

  return (
    <Modal
      title={mode === 'create' ? '创建角色' : '编辑角色'}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
    >
      <Form form={form}>
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
            <div style={{ marginTop: 4, maxHeight: 250, overflowY: 'auto' }}>
              <Tree
                checkable
                checkedKeys={checkedKeys}
                onSelect={onSelect}
                onCheck={checkedKeys => setCheckedKeys(checkedKeys as string[])}
                treeData={treeData}
              />
            </div>
          </Form.Item>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default RoleFormModal
