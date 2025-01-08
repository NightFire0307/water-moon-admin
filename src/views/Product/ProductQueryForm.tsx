import type { IProductType } from '@/types/product.ts'
import { CustomForm } from '@/components/CustomForm.tsx'

interface IProductQueryFormProps {
  productTypeOptions: IProductType[]
  onQuery: (values: { name?: string, productType?: number }) => void
  onReset: () => void
}

export function ProductQueryForm(props: IProductQueryFormProps) {
  const { onQuery, onReset, productTypeOptions } = props

  return (
    <CustomForm
      layout="inline"
      fields={[
        {
          label: '产品名称',
          name: 'name',
          type: 'input',
          placeholder: '请输入产品名称',
        },
        {
          label: '产品类型',
          name: 'productTypeId',
          type: 'select',
          placeholder: '请选择产品类型',
          options: productTypeOptions,
          filedNames: { label: 'name', value: 'id' },
        },
      ]}
      submitButtonText="查询"
      onSubmit={onQuery}
      onReset={onReset}
    />
  )
}
