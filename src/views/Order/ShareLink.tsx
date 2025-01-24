import type { CustomFormRef, Field } from '@/components/CustomForm.tsx'
import { CustomForm } from '@/components/CustomForm.tsx'
import { useShareLink } from '@/store/useShareLink'
import { LockedOrder } from '@/views/Order/OrderModalForm.tsx'
import { forwardRef, useContext, useImperativeHandle, useRef } from 'react'

export interface ShareLinkRef {
  generateShareUrl: () => void
}

interface ShareLinkForm {
  access_limit: number
  access_password: string
  custom_password?: string
  password_generate: 'random' | 'custom'
  expired_at: number
}

export const ShareLink = forwardRef<ShareLinkRef>((_, ref) => {
  const fields: Field[] = [
    {
      label: '有效期',
      name: 'expired_at',
      type: 'radioGroup',
      radioOptions: [
        {
          label: '7天',
          value: 7,
        },
        {
          label: '15天',
          value: 15,
        },
        {
          label: '30天',
          value: 30,
        },
        {
          label: '永不过期',
          value: 0,
        },
      ],
    },
    {
      label: '访问密码',
      name: 'access_password',
      type: 'group',
      children: [
        {
          name: 'password_generate',
          type: 'radioGroup',
          radioOptions: [
            {
              label: '随机生成',
              value: 'random',
            },
            {
              label: '自定义',
              value: 'custom',
            },
          ],
          children: [
            {
              whenShow: {
                name: 'password_generate',
                value: 'custom',
              },
              name: 'custom_password',
              type: 'input',
              placeholder: '请输入自定义密码',
              fieldCols: 3,
              count: {
                show: true,
                max: 6,
                strategy: txt => txt.length,
                exceedFormatter: (txt, { max }) => txt.slice(0, max),
              },
            },
          ],
        },
      ],
    },
    {
      label: '访问人数限制',
      name: 'access_limit',
      type: 'select',
      options: [
        {
          label: '不限制',
          value: 0,
        },
        {
          label: '1人',
          value: 1,
        },
        {
          label: '3人',
          value: 3,
        },
        {
          label: '5人',
          value: 5,
        },
        {
          label: '10人',
          value: 10,
        },
      ],
    },
  ]
  const customFormRef = useRef<CustomFormRef>(null)
  const { createShareUrl } = useShareLink()
  const lockedOrder = useContext(LockedOrder)

  useImperativeHandle(ref, () => ({
    generateShareUrl: async () => {
      const { access_password, expired_at }: ShareLinkForm = customFormRef.current?.getFormValues()
      createShareUrl(lockedOrder.id, access_password, expired_at)
    },
  }))

  return (
    <CustomForm
      ref={customFormRef}
      initialValues={{
        expired_at: 7,
        access_limit: 0,
        password_generate: 'random',
      }}
      fields={fields}
      footer={null}
    />
  )
})
