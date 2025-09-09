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
    photoNames: {
      name: string
      remark: string
    }[]
  }[]
}

interface PdfDocumentProps {
  data: DocumentData
}

const fields = [
  { label: '客户编号', key: 'orderNumber' },
  { label: '客户姓名', key: 'customerName' },
  { label: '客户手机', key: 'customerPhone' },
  { label: '门市', key: 'store' },
  { label: '摄影师', key: 'photographer' },
  { label: '造型师', key: 'stylist' },
  { label: '选片师', key: 'selector' },
  { label: '拍照日', key: 'shootDate' },
  { label: '选片日', key: 'selectDate' },
  { label: '取件日', key: 'pickupDate' },
  { label: '加挑金额', key: 'extraMoney' },
  { label: '总张数', key: 'totalPhotos' },
]

Font.register({
  family: 'NotoSansSC',
  src: '/public/fonts/NotoSansSC-Regular.ttf',
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    padding: 30,
    lineHeight: 1.6,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    marginBottom: 25,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#e2e8f0',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottom: '2px solid #3b82f6',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    border: '1px solid #e2e8f0',
  },
  infoItem: {
    width: '50%',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  infoLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  productCard: {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #f1f5f9',
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  productType: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 3,
    borderRadius: 4,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productDetailItem: {
    flex: 1,
    marginRight: 10,
  },
  productDetailLabel: {
    fontSize: 9,
    color: '#9ca3af',
    marginBottom: 2,
  },
  productDetailValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
  },
  photoIdsContainer: {
    marginTop: 8,
  },
  photoIdsLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
  },
  photoIds: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoId: {
    fontSize: 9,
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    padding: 4,
    borderRadius: 4,
    border: '1px solid #dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
})

export function PdfDocument({ data }: PdfDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 页面头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>产品制作单</Text>
          <Text style={styles.subtitle}>Product Production Sheet</Text>
        </View>

        {/* 客户基本信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>客户信息</Text>
          <View style={styles.infoGrid}>
            {fields.map(({ label, key }, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{data !== null ? data[key as keyof PdfData] || '-' : '-' }</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 产品选择详情 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>产品详情</Text>
          {data && data.orderProducts.map((product, index) => (
            <View key={index} style={styles.productCard}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productType}>{product.type}</Text>
              </View>

              <View style={styles.productDetails}>
                <View style={styles.productDetailItem}>
                  <Text style={styles.productDetailLabel}>数量</Text>
                  <Text style={styles.productDetailValue}>{product.count}</Text>
                </View>
                <View style={styles.productDetailItem}>
                  <Text style={styles.productDetailLabel}>单片数量</Text>
                  <Text style={styles.productDetailValue}>{product.photoNames.length}</Text>
                </View>
              </View>

              <View style={styles.photoIdsContainer}>
                <Text style={styles.photoIdsLabel}>选择照片编号</Text>
                <View style={styles.photoIds}>
                  {product.photoNames.map((photoName, i) => (
                    <Text key={i} style={styles.photoId}>
                      {photoName.name}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ))}
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
