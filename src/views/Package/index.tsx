import type { IPackage } from '@/types/package'
import type { TableProps } from 'antd/lib'
import { createPackage, deletePackage, getPackageById, getPackageList, updatePackage } from '@/apis/package'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { useFetch } from '@/hooks/useFetch'
import usePagination from '@/hooks/usePagination'
import useTableSelection from '@/hooks/useTableSelection'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Badge, Button, Divider, Empty, message, Modal, Popover, Space, Table, Tag } from 'antd'
import { useForm } from 'antd/es/form/Form'
import cs from 'classnames'
import { Package, RotateCcw, Trash } from 'lucide-react'
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
    <>
      {
        items.length === 0
          ? <Empty description="暂无产品" />
          : (
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
    </>
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
  const { current, pageSize, pagination, setTotal } = usePagination()
  const { loading, refetch } = useFetch(getPackageList, {
    manual: true,
    onSuccess: (result) => {
      setDataSource(result.list)
      setTotal(result.total)
    },
  })
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
          <div className={
            cs(styles.packageSummary__items, items.length !== 0 ? styles.default : styles.warning)
          }
          >
            {
              items.length === 0
                ? <span className={styles.packageSummary__empty}>暂无产品</span>
                : (
                    <>
                      <Package size={16} />
                      <span className={styles.packageSummary__count}>
                        {items.length}
                      </span>
                      <span className={styles.packageSummary__label}>个产品</span>
                    </>
                  )
            }
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
      label: '套餐名称',
      placeholder: '请输入套餐名称',
    },
    {
      type: 'select',
      name: 'is_published',
      label: '上架状态',
      placeholder: '请选择上架状态',
      options: [
        { label: <Badge status="success" text="已上架" />, value: true },
        { label: <Badge status="error" text="未上架" />, value: false },
      ],
    },
  ]

  async function handleCreatePackage(value: PackageFormValues) {
    try {
      const { msg } = await createPackage(value)
      message.success(msg)
      setModalState({ open: false, mode: 'create' })
      refetch()
    }
    catch (err) {
      message.error('创建套餐失败，请稍后重试')
      console.error(err)
    }
  }

  async function handleEditPackage(packageId: number) {
    const { data } = await getPackageById(packageId)
    setModalState({
      open: true,
      mode: 'edit',
      initialValues: data,
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
          refetch()
        }
        catch (err) {
          message.error('删除套餐失败，请稍后重试')
          console.error(err)
        }
      },
      onCancel() {
        message.info('已取消删除操作')
      },
    })
  }

  async function handleUpdatePackage(packageId: number, value: PackageFormValues) {
    try {
      const { msg } = await updatePackage(packageId, value)
      message.success(msg)
      setModalState({ open: false, mode: 'create' })
      refetch()
    }
    catch (e) {
      console.error(e)
    }
  }

  function handleSearchPackage() {
    const values = form.getFieldsValue()
    refetch({
      name: values.name,
      is_published: values.is_published,
    })
  }

  useEffect(() => {
    refetch({
      current,
      pageSize,
    })
  }, [current, pageSize])

  return (
    <div style={{ padding: '24px' }}>
      <Space>
        <SimpleForm fields={fields} form={form} layout="inline" />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearchPackage}>
          查询
        </Button>
        <Button
          icon={<RotateCcw size={14} />}
          onClick={() => {
            form.resetFields()
            refetch()
          }}
        >
          重置
        </Button>
      </Space>
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
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        loading={loading}
        pagination={pagination}
      />
      <PackageModal
        open={modalState.open}
        mode={modalState.mode}
        initialData={modalState.initialValues}
        onClose={() => setModalState({ open: false, mode: 'create' })}
        onCreate={handleCreatePackage}
        onUpdate={handleUpdatePackage}
      />
    </div>
  )
}

export default PackageManager
