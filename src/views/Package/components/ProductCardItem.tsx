import type { FC } from 'react'
import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'

export interface Product {
  productId: number
  name: string
  count: number
}

interface ProductCardItemProps {
  products: Product[]
  // 增加产品数量
  onIncreaseProduct?: (productId: number) => void
  // 减少产品数量
  onDecreaseProduct?: (productId: number) => void
  onRemoveProduct?: (productId: number) => void
}

export const ProductCardItem: FC<ProductCardItemProps> = ({ products, onIncreaseProduct, onDecreaseProduct, onRemoveProduct }) => {
  return (
    <>
      {
        products.map(product => (
          <Flex justify="space-between" key={product.productId}>
            <Flex gap={16} align="center">
              <div>
                <div>{product.name}</div>
              </div>
            </Flex>
            <Flex align="center" gap={16}>
              <Flex align="center" gap={16}>
                <Button icon={<MinusOutlined />} onClick={() => onDecreaseProduct && onDecreaseProduct(product.productId)} />
                <div>{product.count}</div>
                <Button icon={<PlusOutlined />} onClick={() => onIncreaseProduct && onIncreaseProduct(product.productId)} />
              </Flex>
              <Button
                type="text"
                icon={<CloseOutlined />}
                danger
                onClick={() => onRemoveProduct && onRemoveProduct(product.productId)}
              />
            </Flex>
          </Flex>
        ),
        )
      }
    </>
  )
}
