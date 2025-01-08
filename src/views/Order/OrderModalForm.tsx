import { CustomForm } from '@/components/CustomForm.tsx'
import { Button, Flex, Modal } from 'antd'

interface OrderModalFormProps {
  mode: 'create' | 'edit'
  open: boolean
}

export function OrderModalForm(props: OrderModalFormProps) {
  const { open, mode } = props
  return (
    <Modal
      width={800}
      title={mode === 'create' ? '新增订单' : '编辑订单'}
      open={open}
      footer={null}
    >
      <CustomForm
        itemPerRow={2}
        fields={[
          {
            label: '订单号',
            name: 'order_number',
            type: 'input',
          },
          {
            label: '客户姓名',
            name: 'customer_name',
            type: 'input',
          },
          {
            label: '客户手机',
            name: 'customer_phone',
            type: 'input',
          },
          {
            label: '允许超选',
            name: 'allow_extra_select',
            type: 'switch',
            children: [
              {
                label: '可选',
                name: 'max_select_photos',
                type: 'inputNumber',
                addonAfter: '张',
              },
              {
                label: '超选单价',
                name: 'extra_photo_price',
                type: 'inputNumber',
                addonAfter: '元 / 张',
                step: 100,
              },
              {
                label: '产品选择',
                name: 'product_id',
                type: 'select',
                multiple: true,
                options: [
                  {
                    label: '产品1',
                    value: 1,
                  },
                  {
                    label: '产品2',
                    value: 2,
                  },
                ],
              },
            ],
          },
        ]}
        footer={(
          <Flex justify="flex-end" gap={8}>
            <Button>重置</Button>
            <Button type="primary">提交</Button>
          </Flex>
        )}
      />
    </Modal>
  )
}
