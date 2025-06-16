import SimpleForm, { type FieldSchema } from '@/components/SimpleForm'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Modal } from 'antd'
import { ShoppingCart, ShoppingCartIcon } from 'lucide-react'
import { type FC, useState } from 'react'
import styles from './PackageModal.module.less'
import { type Product, ProductCardItem } from './ProductCardItem'

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
      addonBefore: '¥',
      addonAfter: '元',
    },
    {
      label: '上架套餐',
      name: 'isPublished',
      type: 'switch',
    },
  ]

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
                      <span>已选择的产品(0)</span>
                    </Flex>
                    <div>
                      总价:￥699.0
                    </div>
                  </Flex>
                )}
              >
                <ProductCardItem products={products} />
              </Card>
            )
      }

    </Modal>
  )
}
