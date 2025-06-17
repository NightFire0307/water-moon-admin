import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Modal } from 'antd'
import { ShoppingCart, ShoppingCartIcon } from 'lucide-react'
import { type FC, useState } from 'react'
import styles from './PackageModal.module.less'
import { type Product, ProductCardItem } from './ProductCardItem'
import { ProductPicker, type ProductPickerData } from './ProductPicker'

interface PackageModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialData?: Record<string, any>
  onClose: () => void
  onSubmit: (data: Record<string, any>) => void
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

export const PackageModal: FC<PackageModalProps> = ({ open, mode, initialData, onClose, onSubmit }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [productsPickerData, setProductsPickerData] = useState<ProductPickerData[]>([
    {
      id: 1,
      category: '手机',
      items: [
        { productId: 1, name: 'iPhone 14 Pro', checked: false },
        { productId: 2, name: 'iPhone 14', checked: false },
        { productId: 3, name: 'iPhone SE', checked: false },
      ]
    },
  ])

  const formFields: FieldSchema[] = [
    {
      label: '套餐名称',
      name: 'name',
      type: 'input',
    },
    {
      label: '套餐价格',
      name: 'price',
      type: 'inputNumber',
      addonAfter: '元',
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
  }

  function handleRemoveProduct(productId: number) {
    setProducts((prev) => prev.filter(product => product.productId !== productId))
  }

  function handleIncreaseProduct(productId: number) {
    setProducts((prev) => {
      return prev.map(product => {
        if (product.productId === productId) {
          return { ...product, count: product.count + 1 }
        }
        return product
      })
    })
  }

  function handleDecreaseProduct(productId: number) {
    setProducts((prev) => {
      return prev.map(product => {
        if (product.productId === productId) {
          return { ...product, count: Math.max(1, product.count - 1) }
        }
        return product
      })
    })
  }

  return (
    <Modal
      title={mode === 'create' ? '创建套餐' : '编辑套餐'}
      open={open}
      onCancel={onClose}
      width={800}
    >
      <SimpleForm
        fields={formFields}
      />

      <Flex align="center" justify="space-between">
        <h3>套餐产品</h3>
        <Button icon={<PlusOutlined />}>选择产品</Button>
      </Flex>

      <Flex vertical gap={16}>
        <ProductPicker
          data={productsPickerData}
          onAddProduct={handleAddProduct}
          onRemoveProduct={handleRemoveProduct}
        />

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
                        <span>已选择的产品({ products.length })</span>
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
                    />
                  </Flex>
                </Card>
              )
        }

      </Flex>

    </Modal>
  )
}
