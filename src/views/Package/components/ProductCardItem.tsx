import type { FC } from 'react'
import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'

export interface Product {
  productId: number
  name: string
  price: number
  count: number
}

interface ProductCardItemProps {
  products: Product[]
}

export const ProductCardItem: FC<ProductCardItemProps> = ({ products }) => {
  return (
    <>
      {
        products.map(product => (
          <Flex justify="space-between" key={product.productId}>
            <Flex gap={16} align="center">
              <div style={{ width: '32px', height: '32px', background: '#eee' }}></div>
              <div>
                <div>{product.name}</div>
                <span>
                  ￥
                  {product.price}
                </span>
              </div>
            </Flex>
            <Flex align="center" gap={16}>
              <Flex align="center" gap={16}>
                <Button type="text" icon={<MinusOutlined />} />
                <div>{product.count}</div>
                <Button type="text" icon={<PlusOutlined />} />
              </Flex>
              <Button type="text" icon={<CloseOutlined />} danger />
            </Flex>
          </Flex>
        ),
        )
      }
    </>
  )
}
