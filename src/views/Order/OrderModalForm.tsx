import type { CustomFormRef, Field } from '@/components/CustomForm.tsx'
import type { IProduct } from '@/types/product.ts'
import { createOrder } from '@/apis/order.ts'
import { getProductList } from '@/apis/product.ts'
import { CustomForm } from '@/components/CustomForm.tsx'
import { ShareLink } from '@/views/Order/ShareLink.tsx'
import { UploadPhoto } from '@/views/Order/UploadPhoto.tsx'
import { Button, message, Modal, Result, Space, Steps } from 'antd'
import { useEffect, useRef, useState } from 'react'

interface OrderModalFormProps {
  open: boolean
  onCancel: () => void
}

export function OrderModalForm(props: OrderModalFormProps) {
  const { open, onCancel } = props
  const [currentStep, setCurrentStep] = useState(0)
  const [createLoading, setCreateLoading] = useState(false)
  const [productOptions, setProductOptions] = useState<IProduct[]>([])
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
      placeholder: '请输入订单号',
    },
    {
      label: '客户姓名',
      name: 'customer_name',
      type: 'input',
      rules: [{
        required: true,
        message: '请输入客户姓名',
      }],
      placeholder: '请输入客户姓名',
    },
    {
      label: '客户手机',
      name: 'customer_phone',
      type: 'input',
      rules: [
        {
          required: true,
          message: '请输入客户手机',
        },
        () => ({
          validator(_, value) {
            if (!value || /^1[3-9]\d{9}$/.test(value)) {
              return Promise.resolve()
            }
            return Promise.reject(new Error('请输入正确的手机号码'))
          },
        }),
      ],
      placeholder: '请输入客户手机',
    },
    {
      label: '可选',
      name: 'max_select_photos',
      type: 'inputNumber',
      addonAfter: '张',
      min: 1,
      placeholder: '请输入可选张数',
      rules: [{
        required: true,
        message: '请输入可选张数',
      }],
    },
    {
      label: '产品选择',
      name: 'order_products',
      type: 'select',
      mode: 'multiple',
      placeholder: '请选择产品',
      fieldNames: { label: 'name', value: 'id' },
      options: [
        {
          label: '单品',
          title: '单品',
          options: productOptions,
        },
        {
          label: '套餐',
          title: '套餐',
          options: [
            {
              name: '套餐-1',
              id: '21',
            },
            {
              name: '套餐-2',
              id: '22',
            },
          ],
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
      name: 'is_extra_allowed',
      type: 'switch',
      fieldCols: 1,
      children: [
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
    if (currentStep === 0) {
      try {
        await formRef.current?.validateFields()
        setCreateLoading(true)
        const values = formRef.current?.getFormValues()
        const { code } = await createOrder(values)
        if (code !== 200) {
          message.error('创建订单失败')
          return
        }

        setCreateLoading(false)
        setCurrentStep(currentStep + 1)
      }
      catch (err) {
        console.log(err)
        message.error('表单校验失败，请检查')
      }
      finally {
        setCreateLoading(false)
      }
    }
  }

  function handlePrev() {
    setCurrentStep(currentStep - 1)
  }

  // 复制链接到剪贴板
  function handleCopyLink() {
    message.success('复制成功')
  }

  async function fetchProductList() {
    const { data } = await getProductList({})
    setProductOptions(data.list)
  }

  useEffect(() => {
    fetchProductList()
  }, [])

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
              initialValues={{
                order_number: 'D9111',
                customer_name: '张三',
                customer_phone: '13800138000',
                max_select_photos: 10,
                is_extra_allowed: false,
              }}
              ref={formRef}
              layout="vertical"
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
                <Button type="primary" onClick={handleCopyLink}>复制链接</Button>,
              ]}
            />
          )
        }
      </div>

      <Space>
        {
          currentStep > 1 && <Button onClick={handlePrev}>上一步</Button>
        }
        {
          currentStep < 3 && <Button type="primary" onClick={handleNext} loading={createLoading}>下一步</Button>
        }
        {
          currentStep === 3 && <Button type="primary" onClick={onCancel}>完成</Button>
        }
      </Space>
    </Modal>
  )
}
