import type { CustomFormRef, Field } from '@/components/CustomForm.tsx'
import { CustomForm } from '@/components/CustomForm.tsx'
import { ShareLink } from '@/views/Order/ShareLink.tsx'
import { UploadPhoto } from '@/views/Order/UploadPhoto.tsx'
import { Button, message, Modal, Result, Space, Steps } from 'antd'
import { useRef, useState } from 'react'

interface OrderModalFormProps {
  open: boolean
  onCancel: () => void
}

export function OrderModalForm(props: OrderModalFormProps) {
  const { open, onCancel } = props
  const [currentStep, setCurrentStep] = useState(0)
  const [createLoading, setCreateLoading] = useState(false)
  const formRef = useRef<CustomFormRef>(null)

  const fields: Field[] = [
    {
      label: '订单号',
      name: 'order_number',
      type: 'input',
      rules: [{
        required: true,
        message: '请输入订单号',
      }],
    },
    {
      label: '客户姓名',
      name: 'customer_name',
      type: 'input',
      rules: [{
        required: true,
        message: '请输入客户姓名',
      }],
    },
    {
      label: '客户手机',
      name: 'customer_phone',
      type: 'input',
      rules: [{
        required: true,
        message: '请输入客户手机',
      }],
    },
    {
      label: '产品选择',
      name: 'product_id',
      type: 'select',
      mode: 'multiple',
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
      rules: [
        {
          required: true,
          message: '请选择产品',
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

  async function handleNext() {
    // TODO: 创建订单
    try {
      await formRef.current?.validateFields()
      setCreateLoading(true)
      const values = formRef.current?.getFormValues()
      console.log(values)

      setTimeout(() => {
        setCreateLoading(false)
        setCurrentStep(currentStep + 1)
      }, 2000)
    }
    catch (err) {
      console.log(err)
      message.error('表单校验失败，请检查')
    }
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
              ref={formRef}
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

        {
          currentStep === 3 && (
            <Result
              status="success"
              title="创建成功"
              subTitle={(
                <div>
                  <p>您可以复制下面的链接，发送给客户，让客户查看照片</p>
                  <div>
                    <span>链接：https://example.com</span>
                    {' '}
                    <span>密码：123456</span>
                    <p>链接有效期为7天，访问次数不限</p>
                  </div>
                </div>
              )}
              extra={[
                <Button type="primary">复制链接</Button>,
              ]}
            />
          )
        }
      </div>

      <Space>
        {
          currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>
        }
        {
          currentStep < 3 && <Button type="primary" onClick={handleNext} loading={createLoading}>下一步</Button>
        }
        {
          currentStep === 3 && <Button type="primary">完成</Button>
        }
      </Space>
    </Modal>
  )
}
