import type { Field } from '@/components/CustomForm.tsx'
import { CustomForm } from '@/components/CustomForm.tsx'

export function ShareLink() {
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

  return (
    <CustomForm
      initialValues={{
        expired_at: 7,
        access_limit: 0,
        password_generate: 'random',
      }}
      fields={fields}
      footer={null}
    />
  )
}
