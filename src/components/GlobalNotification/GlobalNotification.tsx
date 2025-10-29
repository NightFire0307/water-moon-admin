import { notification } from 'antd'
import { useGlobalNotification } from '@/store/useGlobalNotification'
import { useEffect } from 'react'

export function GlobalNotification() {
  const [api, contextHolder] = notification.useNotification()
  const { notifications, removeNotification } = useGlobalNotification()

  useEffect(() => {
    if (notifications.length === 0) return
    notifications.forEach(({ key, message, description, type }) => {
      api.open({
        key,
        message,
        description,
        type,
      })

      removeNotification(key)
    })
  }, [notifications])

  return (
    <div>
      {contextHolder}
    </div>
  )
}
