import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface PdfData {
  id: number
  orderNumber: string
  customerName: string
  customerPhone: string
  selectDate: string
  extraPhotoMoney: number
  totalPhotos: number
}

export type DocumentData = PdfData & {
  orderProducts: {
    id: number
    name: string
    type: string
    count: number
    photoNames: { name: string, remark?: string }[]
  }[]
}

interface PdfDocumentProps {
  data: DocumentData
  companyName?: string
}

const fields = [
  [
    { label: '订单号', key: 'orderNumber' },
    { label: '客  户', key: 'customerName' },
    { label: '手  机', key: 'customerPhone' },
    { label: '门  市', key: 'store' },
  ],
  [
    { label: '摄影师', key: 'photographer' },
    { label: '造型师', key: 'stylist' },
    { label: '选片师', key: 'selector' },
    { label: '拍照日', key: 'shootDate' },
  ],
  [
    { label: '选片日', key: 'selectDate' },
    { label: '取件日', key: 'pickupDate' },
    { label: '加挑金额', key: 'extraMoney' },
    { label: '取件方式', key: 'pickupMethod' },
  ],
]

Font.register({
  family: 'NotoSansSC',
  src: '/public/fonts/NotoSansSC-Regular.ttf',
})

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    padding: 8,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#e2e8f0',
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    borderBottomStyle: 'solid',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
  },
  productContainer: {
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productContent: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'dashed',
  },
  productPhotos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footer: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 0,
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

export function PdfDocument({ data, companyName = '王开摄影' }: PdfDocumentProps) {
  function chunkArray<T>(array: T[], chunkSize: number = 4): T[][] {
    const result: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize))
    }
    return result
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 页面头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>{`${companyName}产品制作单`}</Text>
        </View>

        {/* 订单基本信息 */}
        <View style={styles.section}>
          {
            fields.map((row, rowIndex) => (
              <View style={styles.row} key={rowIndex}>
                {row.map((field, cellIndex) => (
                  <Text style={styles.cell} key={`${rowIndex}-${cellIndex}`}>
                    {field.label}
                    ：
                    {data ? (data as any)[field.key] ?? '' : ''}
                  </Text>
                ))}
              </View>
            ))
          }
          <Text style={{ textAlign: 'right' }}>
            总张数：
            {data ? data.totalPhotos ?? '' : ''}
          </Text>
        </View>

        {/* 产品选择详情 */}
        <View style={styles.productContainer}>
          {
            data?.orderProducts.map(product => (
              <View key={product.id} style={{ borderBottom: '1px solid #999' }}>
                <View style={styles.productHeader}>
                  <Text>{product.name}</Text>
                  <Text>
                    类型：
                    {product.type}
                  </Text>
                  <Text>
                    数量：
                    {product.count}
                  </Text>
                </View>
                <View>
                  {
                    chunkArray(product.photoNames).map((photoRow, rowIndex) => (
                      <View key={rowIndex} style={styles.productPhotos}>
                        {photoRow.map((photo, photoIndex) => (
                          <Text key={`${photo.name}-${photoIndex}`}>
                            {photo.name}
                          </Text>
                        ))}
                      </View>
                    ))
                  }
                </View>
              </View>
            ))
          }
        </View>

        {/* 页脚 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            本单据由系统自动生成 | 生成时间：
            {new Date().toLocaleString('zh-CN')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
