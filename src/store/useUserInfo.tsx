import * as localforage from 'localforage'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UserInfoStore {
  accessToken: string
}

interface UserInfoAction {
  saveToken: (accessToken: string) => Promise<void>
  loadToken: () => Promise<void>
  clearToken: () => Promise<void>
}

export const useUserInfo = create<UserInfoStore & UserInfoAction>()(
  devtools(set => ({
    accessToken: '',
    saveToken: async (accessToken: string) => {
      // 更新本地 Token
      try {
        await localforage.setItem('accessToken', accessToken)
      }
      catch (err) {
        console.error(err)
      }
      return set({ accessToken })
    },
    loadToken: async () => {
      try {
        const accessToken: string | null = await localforage.getItem('accessToken')
        if (accessToken) {
          return set({ accessToken })
        }

        return set({ accessToken: '' })
      }
      catch (err) {
        console.error(err)
      }
    },
    clearToken: async () => {
      set({ accessToken: '' })
      await localforage.removeItem('accessToken')
    },
  }), {
    name: 'userInfo',
    enabled: true,
  }),
)
