import { create } from 'zustand'

interface NotificationItem {
  key: string
  message: string
  description?: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

interface GlobalNotificationState {
  notifications: NotificationItem[]
}

interface GlobalNotificationActions {
  addNotification: (notification: NotificationItem) => void
  removeNotification: (key: string) => void
}

export const useGlobalNotification = create<GlobalNotificationState & GlobalNotificationActions>(
  set => ({
    notifications: [],
    addNotification: notification =>
      set(state => ({
        notifications: [...state.notifications, notification],
      })),
    removeNotification: key =>
      set(state => ({
        notifications: state.notifications.filter(n => n.key !== key),
      })),
  }),
)
