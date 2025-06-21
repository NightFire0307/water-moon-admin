import type { IPackage } from '@/types/package'
import type { TableProps } from 'antd/lib'
import { createPackage, getPackageList, deletePackage, getPackageById } from '@/apis/package'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import useTableSelection from '@/hooks/useTableSelection'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, message, Modal, Popover, Space, Table, Tag } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { Package, Trash } from 'lucide-react'
import { type FC, useEffect, useState } from 'react'
import { PackageActions } from './components/PackageActions'
import { type PackageFormValues, PackageModal } from './components/PackageModal'
import styles from './index.module.less'

const { confirm } = Modal

interface PackageProductDetailProps {
  items: Record<string, any>[]
}

function PackageProductDetail({ items }: PackageProductDetailProps) {
  return (
    <div className={styles.packageProductDetail}>
      <div className={styles.packageProductDetail__header}>
        <Package size={16} />
        <span>包含产品</span>
      </div>
      <Divider className={styles.packageProductDetail__divider} />
      <div className={styles.packageProductDetail__content}>
        {
          items.map((item, index) => (
            <div className={styles.packageProductDetail__item} key={item.id}>
              <div className={styles.packageProductDetail__itemMain}>
                <div className={styles.packageProductDetail__itemIndex}>{index + 1}</div>
                <div className={styles.packageProductDetail__itemName}>{item.product.name}</div>
              </div>
              <div className={styles.packageProductDetail__count}>{`x${item.count}`}</div>
            </div>
          ))
        }
      </div>

      <Divider className={styles.packageProductDetail__divider} />
      <div className={styles.packageProductDetail__footer}>
        <div className={styles.packageProductDetail__totalLabel}>总数量</div>
        <div className={styles.packageProductDetail__totalValue}>
          {items.length}
          件
        </div>
      </div>
    </div>
  )
}

interface ModalState {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: PackageFormValues
}

const PackageManager: FC = () => {
  const [modalState, setModalState] = useState<ModalState>({ open: false, mode: 'create', initialValues: {} as PackageFormValues })
  const [dataSource, setDataSource] = useState<IPackage[]>([])
  const [form] = useForm()
  const { rowSelection } = useTableSelection({ type: 'checkbox' })

  const columns: TableProps<IPackage>['columns'] = [
    {
      dataIndex: 'name',
      title: '套餐名称',
    },
    {
      dataIndex: 'price',
      title: '套餐价格',
      render: price => (
        <span style={{ fontWeight: '600' }}>
          ￥
          {price}
        </span>
      ),
    },
    {
      dataIndex: 'items',
      title: '产品数量',
      render: items => (
        <Popover content={<PackageProductDetail items={items} />} placement="right">
          <div className={styles.items}>
            <Package size={16} />
            <span style={{ fontWeight: 600 }}>
              {items.length}
            </span>
            <span>个产品</span>
          </div>
        </Popover>
      ),
    },
    {
      dataIndex: 'is_published',
      title: '是否上架',
      render: isPublished => (
        <Tag color={isPublished ? 'green' : 'red'}>
          {isPublished ? '已上架' : '未上架'}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: (item: IPackage) => (
        <PackageActions
          onEdit={() => handleEditPackage(item.id)}
          onDelete={() => handleDeletePackage(item.id)}
        />
      ),
    },
  ]

  const fields: FieldSchema[] = [
    {
      type: 'input',
      name: 'name',
      placeholder: '请输入套餐名称',
    },
    {
      type: 'select',
      name: 'products',
      options: [
        {
          label: '选择1',
          value: '1',
        },
      ],
      placeholder: '请选择产品',
    },
  ]

  async function handleCreatePackage(value: PackageFormValues) {
    try {
      const { msg } = await createPackage(value)
      message.success(msg)
      setModalState({ open: false, mode: 'create' })
      fetchPackageData()
    }
    catch (err) {
      message.error('创建套餐失败，请稍后重试')
      console.error(err)
    }
  }

  async function handleEditPackage(packageId: number) {
    console.log(packageId)
    const { data } = await getPackageById(packageId)
    setModalState({
      open: true,
      mode: 'edit',
      initialValues: data
    })
  }

  function handleDeletePackage(packageId: number) {
    confirm({
      title: '确认删除',
      content: '您确定要删除此套餐吗？此操作不可逆。',
      okText: '删除',
      okType: 'danger',
      onOk: async () => {
        try {
          const { msg } = await deletePackage(packageId)
          message.success(msg) 
          fetchPackageData()
        } catch(err) {
          message.error('删除套餐失败，请稍后重试')
          console.error(err)
        }
      },
      onCancel() {
        message.info('已取消删除操作')
      },
    })
  }

  async function fetchPackageData() {
    const { data } = await getPackageList()
    setDataSource(data)
  }

  useEffect(() => {
    fetchPackageData()
  }, [])

  return (
    <div style={{ padding: '24px' }}>
      <SimpleForm fields={fields} form={form} layout="inline" />
      <Divider />
      <Space direction="horizontal" style={{ marginBottom: '24px' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalState({ open: true, mode: 'create' })}
        >
          创建套餐
        </Button>
        <Button type="primary" icon={<Trash size={16} />} danger disabled>
          批量删除
        </Button>
      </Space>
      <Table rowKey="id" columns={columns} dataSource={dataSource} rowSelection={rowSelection} />
      <PackageModal
        open={modalState.open}
        mode={modalState.mode}
        initialData={modalState.initialValues}
        onClose={() => setModalState({ open: false, mode: 'create' })}
        onSubmit={handleCreatePackage}
      />
    </div>
  )
}

export default PackageManager
