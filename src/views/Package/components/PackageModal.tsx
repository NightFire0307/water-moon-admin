import type { IPackage } from '@/types/package'
import { getProductByCategory } from '@/apis/product'
import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, message, Modal } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { ShoppingCart, ShoppingCartIcon } from 'lucide-react'
import { type FC, useEffect, useRef, useState } from 'react'
import styles from './PackageModal.module.less'
import { type Product, ProductCardItem } from './ProductCardItem'
import { ProductPicker, type ProductPickerData } from './ProductPicker'

export interface PackageFormValues {
  name: string
  price: number
  isPublished: boolean
  items: Product[]
}

interface PackageModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: IPackage
  onClose?: () => void
  onCreate?: (data: PackageFormValues) => void
  onUpdate?: (packageId: number, data: PackageFormValues) => void
}

// 空产品
function EmptyProduct() {
  return (
    <div className={styles.emptyProduct}>
      <ShoppingCart className={styles.emptyProductIcon} />
      <div>暂无产品，请点击"选择产品"按钮添加产品到套餐中</div>
    </div>
  )
}

export const PackageModal: FC<PackageModalProps> = ({ open, mode, initialData, onClose, onCreate, onUpdate }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [productsPickerData, setProductsPickerData] = useState<ProductPickerData[]>([])
  const [productPickerVisible, setProductPickerVisible] = useState(false)
  const [form] = useForm()
  const cacheSelectedIds = useRef<Set<number>>(new Set())

  const formFields: FieldSchema[] = [
    {
      label: '套餐名称',
      name: 'name',
      type: 'input',
      required: true,
      placeholder: '请输入套餐名称',
    },
    {
      label: '套餐价格',
      name: 'price',
      type: 'inputNumber',
      addonAfter: '元',
      placeholder: '请输入套餐价格',
    },
    {
      label: '上架套餐',
      name: 'isPublished',
      type: 'switch',
    },
  ]

  function handleAddProduct(product: { productId: number, name: string }) {
    setProducts((prev) => {
      return [...prev, { productId: product.productId, name: product.name, count: 1 }]
    })

    // 缓存已选择的产品ID
    cacheSelectedIds.current.add(product.productId)
  }

  function handleRemoveProduct(productId: number) {
    setProducts(prev => prev.filter(product => product.productId !== productId))

    // 移除缓存中的产品ID
    if (cacheSelectedIds.current.has(productId)) {
      cacheSelectedIds.current.delete(productId)
    }
  }

  function handleIncreaseProduct(productId: number) {
    setProducts((prev) => {
      return prev.map((product) => {
        if (product.productId === productId) {
          return { ...product, count: product.count + 1 }
        }
        return product
      })
    })
  }

  function handleDecreaseProduct(productId: number) {
    setProducts((prev) => {
      return prev.map((product) => {
        if (product.productId === productId) {
          return { ...product, count: Math.max(1, product.count - 1) }
        }
        return product
      })
    })
  }

  async function handleOk() {
    try {
      await form.validateFields()
      const value = form.getFieldsValue()
      if (mode === 'create') {
        onCreate && onCreate({
          items: [
            ...products,
          ],
          ...value,
        })
      }

      if (mode === 'edit') {
        onUpdate && onUpdate(initialData!.id, {
          items: [
            ...products,
          ],
          ...value,
          price: Number(value.price),
        })
      }
    }
    catch {
      message.error('请填写完整的表单信息')
    }
  }

  async function fetchProductByCategory(keyword?: string) {
    const { data } = await getProductByCategory(keyword)
    setProductsPickerData(() => {
      return data.map(item => ({
        id: item.id,
        category: item.category,
        items: item.items.map(product => ({
          productId: product.productId,
          name: product.name,
          checked: cacheSelectedIds.current.has(product.productId) || false,
        })),
      }))
    })
  }

  useEffect(() => {
    if (open) {
      fetchProductByCategory()
      form.setFieldsValue({
        name: initialData?.name ?? '',
        price: initialData?.price ?? 0,
        isPublished: initialData?.is_published ?? true,
      })

      // TODO: 定义类型
      initialData?.items.forEach((item) => {
        cacheSelectedIds.current.add(item.product.productId)

        setProducts(prev => ([
          ...prev,
          {
            productId: item.product.productId,
            name: item.product.name,
            count: item.count,
          },
        ]))
      })
    }
    else {
      // 重置表单和产品列表
      form.resetFields()
      setProducts([])
      setProductsPickerData([])
      cacheSelectedIds.current.clear()
    }
  }, [open, initialData])

  return (
    <Modal
      title={mode === 'create' ? '创建套餐' : '编辑套餐'}
      open={open}
      onCancel={onClose}
      width={800}
      onOk={handleOk}
    >
      <SimpleForm
        form={form}
        fields={formFields}
        initialValues={{
          isPublished: true,
          price: 0,
        }}
      />

      <Flex align="center" justify="space-between">
        <h3>套餐产品</h3>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setProductPickerVisible(prev => !prev)}
        >
          选择产品
        </Button>
      </Flex>

      <Flex vertical gap={16}>
        {
          productPickerVisible && (
            <ProductPicker
              data={productsPickerData}
              onSearch={fetchProductByCategory}
              onAddProduct={handleAddProduct}
              onRemoveProduct={handleRemoveProduct}
            />
          )
        }

        {
          products.length === 0
            ? (
                <EmptyProduct />
              )
            : (
                <Card
                  type="inner"
                  title={(
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={8}>
                        <ShoppingCartIcon size={16} />
                        <span>
                          已选择的产品(
                          { products.length }
                          )
                        </span>
                      </Flex>
                    </Flex>
                  )}
                  styles={{
                    body: { maxHeight: 200, overflowY: 'auto' },
                  }}
                >
                  <Flex vertical gap={16}>
                    <ProductCardItem
                      products={products}
                      onIncreaseProduct={handleIncreaseProduct}
                      onDecreaseProduct={handleDecreaseProduct}
                      onRemoveProduct={handleRemoveProduct}
                    />
                  </Flex>
                </Card>
              )
        }

      </Flex>

    </Modal>
  )
}
