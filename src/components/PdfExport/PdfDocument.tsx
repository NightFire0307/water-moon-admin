import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

Font.register({
  family: 'NotoSansSC',
  src: '/public/fonts/NotoSansSC-Regular.ttf',
})

const styles = StyleSheet.create({
  page: {
    padding: 14,
    fontFamily: 'NotoSansSC',
    fontSize: 10,
    lineHeight: 1.5,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 80,
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderTop: '1px solid #000',
    borderBottom: '1px solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  col: {
    width: '20%',
  },
  notes: {
    marginTop: 10,
    fontSize: 8,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    fontSize: 9,
  },
})

export function PdfDocument() {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 顶部客户信息 */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>客户编号:</Text>
            <Text style={styles.value}>A177480</Text>
            <Text style={styles.label}>客户:</Text>
            <Text style={styles.value}>刘包泽 138001380000</Text>
            <Text style={styles.label}>打印日:</Text>
            <Text style={styles.value}>2025-06-14</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>拍摄师:</Text>
            <Text style={styles.value}></Text>
            <Text style={styles.label}>选片师:</Text>
            <Text style={styles.value}></Text>
            <Text style={styles.label}>取件方式:</Text>
            <Text style={styles.value}></Text>
          </View>
        </View>

        <View>
          {/* 表格头 */}
          <View style={styles.tableHeader}>
            <Text style={styles.col}>产品</Text>
            <Text style={styles.col}>类别</Text>
            <Text style={styles.col}>P数</Text>
            <Text style={styles.col}>数量</Text>
            <Text style={styles.col}>单片</Text>
          </View>

          {/* 表格内容（示例：一行） */}
          <View style={styles.tableRow}>
            <Text style={styles.col}>麦琪10寸册</Text>
            <Text style={styles.col}>10寸</Text>
            <Text style={styles.col}>0</Text>
            <Text style={styles.col}>1</Text>
            <Text style={styles.col}>26张</Text>
          </View>

          {/* 照片编号块（建议分页或分组） */}
          <View style={{ marginTop: 10 }}>
            <Text>照片编号：</Text>
            <Text>776A7967、776A7971、776A8013</Text>
          </View>

        </View>

        <View>
          {/* 表格头 */}
          <View style={styles.tableHeader}>
            <Text style={styles.col}>产品</Text>
            <Text style={styles.col}>类别</Text>
            <Text style={styles.col}>P数</Text>
            <Text style={styles.col}>数量</Text>
            <Text style={styles.col}>单片</Text>
          </View>

          {/* 表格内容（示例：一行） */}
          <View style={styles.tableRow}>
            <Text style={styles.col}>麦琪10寸册</Text>
            <Text style={styles.col}>10寸</Text>
            <Text style={styles.col}>0</Text>
            <Text style={styles.col}>1</Text>
            <Text style={styles.col}>26张</Text>
          </View>

          {/* 照片编号块（建议分页或分组） */}
          <View style={{ marginTop: 10 }}>
            <Text>照片编号：</Text>
            <Text>776A7967、776A7971、776A8013、776A7967、776A7971、776A8013、776A7967、776A7971、776A8013、776A7967、776A7971、776A8013</Text>
          </View>

        </View>

        {/* 备注说明 */}
        <Text style={styles.notes}>
          &lt;不能修饰的部分&gt;
          {'\n'}
          脸部光线、阴影已调正大小方向、牙齿矫正、发丝、眼神、睫毛长短、眼镜镜片反光...
        </Text>

        {/* 页脚 */}
        <View style={styles.signatureRow}>
          <Text>页数：1/1</Text>
          <Text>服务人员签名：__________</Text>
          <Text>客户签名：__________</Text>
        </View>
      </Page>
    </Document>
  )
}
