import type { Field } from '@/components/CustomForm.tsx'
import { CustomForm } from '@/components/CustomForm.tsx'
import { ShareLink } from '@/views/Order/ShareLink.tsx'
import { UploadPhoto } from '@/views/Order/UploadPhoto.tsx'
import { Button, Modal, Space, Steps } from 'antd'
import { useState } from 'react'

interface OrderModalFormProps {
  open: boolean
  onCancel: () => void
}

export function OrderModalForm(props: OrderModalFormProps) {
  const { open, onCancel } = props
  const [currentStep, setCurrentStep] = useState(0)

  const fields: Field[] = [
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
      label: '产品选择',
      name: 'product_id',
      type: 'select',
      mode: 'tags',
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
    {
      label: '允许超选',
      name: 'allow_extra_select',
      type: 'switch',
      fieldCols: 1,
      children: [
        {
          label: '可选',
          name: 'max_select_photos',
          type: 'inputNumber',
          addonAfter: '张',
          min: 1,
        },
        {
          label: '超选单价',
          name: 'extra_photo_price',
          type: 'inputNumber',
          addonAfter: '元 / 张',
          step: 100,
        },
      ],
    },
  ]

  function handleNext() {
    // TODO: 创建订单

    setCurrentStep(currentStep + 1)
  }

  function handlePrev() {
    setCurrentStep(currentStep - 1)
  }

  return (
    <Modal
      width={800}
      title="创建选片订单"
      open={open}
      footer={null}
      onCancel={onCancel}
    >
      <Steps
        current={currentStep}
        items={[
          {
            title: '创建订单',
          },
          {
            title: '上传照片',
          },
          {
            title: '链接设置',
          },
          {
            title: '完成',
          },
        ]}
        style={{
          marginTop: '16px',
        }}
      >
      </Steps>

      <div style={{
        marginTop: '16px',
        marginBottom: '16px',
      }}
      >
        {
          currentStep === 0 && (
            <CustomForm
              fieldCols={2}
              fields={fields}
              footer={null}
            />
          )
        }

        {
          currentStep === 1 && <UploadPhoto />
        }

        {
          currentStep === 2 && <ShareLink />
        }
      </div>

      <Space>
        {
          currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>
        }
        {
          currentStep < 3 && <Button type="primary" onClick={handleNext}>下一步</Button>
        }
        {
          currentStep === 3 && <Button type="primary">完成</Button>
        }
      </Space>
    </Modal>
  )
}
