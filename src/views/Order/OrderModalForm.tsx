import type { CreateOrderData } from '@/types/order.ts'
import type { CreateOrderRef } from '@/views/Order/CreateOrder.tsx'
import { createOrder } from '@/apis/order.ts'
import { CreateOrder } from '@/views/Order/CreateOrder.tsx'
import { ShareLink } from '@/views/Order/ShareLink.tsx'
import { UploadPhoto } from '@/views/Order/UploadPhoto.tsx'
import { Button, message, Modal, Result, Space, Steps } from 'antd'
import { createContext, useRef, useState } from 'react'

export const LockedOrder = createContext(false)

interface OrderModalFormProps {
  open: boolean
  onCancel: () => void
}

export function OrderModalForm(props: OrderModalFormProps) {
  const { open, onCancel } = props
  const [currentStep, setCurrentStep] = useState(0)
  const [createLoading, setCreateLoading] = useState(false)
  const [submittedOrderData, setSubmittedOrderData] = useState<CreateOrderData>({} as CreateOrderData)
  const [lockedOrder, setLockedOrder] = useState(false)
  const formRef = useRef<CreateOrderRef>(null)

  async function handleNext() {
    if (currentStep === 0 && !lockedOrder) {
      try {
        setCreateLoading(true)
        const values = await formRef.current?.getValues()
        if (!values)
          return message.error('获取表单数据失败')

        const { code } = await createOrder(values)
        if (code !== 201) {
          message.error('创建订单失败')
          return
        }
        message.success('创建订单成功')

        // 保存订单信息并锁定订单信息
        setSubmittedOrderData(values)
        setLockedOrder(true)

        setCreateLoading(false)
        setCurrentStep(currentStep + 1)
      }
      catch {
        message.error('表单校验失败，请检查')
      }
      finally {
        setCreateLoading(false)
      }
    }
    else {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrev() {
    setCurrentStep(currentStep - 1)
  }

  // 复制链接到剪贴板
  function handleCopyLink() {
    // TODO: 复制链接到剪贴板
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
            <LockedOrder.Provider value={lockedOrder}>
              <CreateOrder ref={formRef} submitData={submittedOrderData} />
            </LockedOrder.Provider>
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
          currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>
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
