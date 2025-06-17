import { Checkbox, Divider, Input } from 'antd'
import { Search } from 'lucide-react'
import { type FC, useEffect, useState } from 'react'
import styles from './ProductPicker.module.less'

interface ProductItemProps {
  name: string
  checked?: boolean
  onClick?: (checked: boolean) => void
}

function ProductItem({ name, checked = false, onClick }: ProductItemProps) {
  return (
    <div className={styles.productItem} onClick={() => onClick?.(!checked)}>
      <div className={styles.productItem__info}>
        <div>{ name }</div>
      </div>
      <Checkbox checked={checked} />
    </div>
  )
}

export interface ProductPickerData {
  id: number
  category: string
  items: { productId: number, name: string, checked?: boolean }[]
}

interface ProductPickerProps {
  data: ProductPickerData[]
  onAddProduct?: (product: { productId: number, name: string }) => void
  onRemoveProduct?: (productId: number) => void
}

export const ProductPicker: FC<ProductPickerProps> = ({ data, onAddProduct, onRemoveProduct }) => {
  const [products, setProducts] = useState<ProductPickerData[]>([])

  function handleProductClick(categoryId: number, productId: number, checked: boolean) {
    if (products.length === 0) return 

    setProducts(prevProducts => (
      prevProducts.map((product) => {
        if (product.id === categoryId) {
          return {
            ...product,
            items: product.items.map(item =>
              item.productId === productId ? { ...item, checked } : item,
            ),
          }
        }
        return product
      })
    ))

    const product = products.find(p => p.id === categoryId)?.items.find(item => item.productId === productId)
    if (!product)
      return

    if (checked) {
      onAddProduct?.({ productId: product.productId, name: product.name })
    }
    else {
      onRemoveProduct?.(productId)
    }
  }

  useEffect(() => {
    if (data.length === 0) return

    // 初始化产品列表
    const initialProducts = data.map(category => ({
      ...category,
      items: category.items.map(item => ({ ...item, checked: false })),
    }))
    setProducts(initialProducts)
  }, [data])

  return (
    <div className={styles.productPickerWrapper}>
      <Input prefix={<Search size={16} />} placeholder="搜索产品或分类..." />

      <div>
        {
          products.map(product => (
            <div key={product.id}>
              <Divider style={{ fontSize: 14 }}>{product.category}</Divider>
              <div className={styles.productPickerWrapper__productList}>
                {product.items.map(item => (
                  <ProductItem
                    key={item.productId}
                    name={item.name}
                    checked={item.checked}
                    onClick={checked => handleProductClick(product.id, item.productId, checked)}
                  />
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
