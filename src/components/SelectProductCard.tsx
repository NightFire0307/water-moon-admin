import { CloseOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Flex, Space } from 'antd'

interface SelectProductCardProps {
  // 套系产品
  seriesProducts: {
    id: number
    name: string
    count: number
  }[]
  // 单品列表
  singleProducts: {
    id: number
    name: string
    count: number
  }[]
  onRemoveSeries: (id: number) => void
  onRemoveSingle: (id: number) => void
  onAddSingleCount: (id: number, count: number) => void
  onMinusSingleCount: (id: number, count: number) => void
}

export function SelectProductCard(props: SelectProductCardProps) {
  const {
    seriesProducts,
    singleProducts,
    onRemoveSeries,
    onRemoveSingle,
    onAddSingleCount,
    onMinusSingleCount,
  } = props

  return (
    <div>
      <p>已选产品</p>
      <Card style={{ maxHeight: '350px', overflow: 'hidden', overflowY: 'auto' }}>
        {
          seriesProducts.length > 0 && (
            <>
              <h3>套系产品:</h3>
              {seriesProducts.map(product => (
                <div key={product.name}>
                  <Flex justify="space-between">
                    <span>{product.name}</span>
                    <span>
                      数量：
                      {product.count}
                    </span>
                  </Flex>
                  <Divider style={{ marginTop: '12px', marginBottom: '12px' }} />
                </div>
              ))}
              <Button onClick={onRemoveSeries}>移除套系</Button>
            </>
          )
        }

        {
          singleProducts.length > 0 && (
            <>
              <h3>额外单品:</h3>
              <Space direction="vertical" style={{ width: '100%' }}>
                {singleProducts.map((product, index) => (
                  <Flex key={index} justify="space-between">
                    <span>{product.name}</span>
                    <Flex gap={16} align="center">
                      <Button icon={<MinusOutlined />} onClick={() => onMinusSingleCount(product.id, 1)} />
                      <span style={{ fontWeight: '500' }}>{product.count}</span>
                      <Button icon={<PlusOutlined />} onClick={() => onAddSingleCount(product.id, 1)} />
                      <Button type="text" icon={<CloseOutlined />} danger onClick={() => onRemoveSingle(product.id)}></Button>
                    </Flex>
                  </Flex>
                ))}
              </Space>
            </>
          )
        }

      </Card>
    </div>
  )
}
