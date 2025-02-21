import * as localforage from 'localforage'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UserInfoStore {
  accessToken: string
  refreshToken: string
}

interface UserInfoAction {
  saveToken: (accessToken: string, refreshToken: string) => Promise<void>
  loadToken: () => Promise<void>
  clearToken: () => Promise<void>
}

export const useUserInfo = create<UserInfoStore & UserInfoAction>()(
  devtools(set => ({
    accessToken: '',
    refreshToken: '',
    saveToken: async (accessToken: string, refreshToken: string) => {
      // 更新本地 Token
      try {
        await localforage.setItem('accessToken', accessToken)
        await localforage.setItem('refreshToken', refreshToken)
      }
      catch (err) {
        console.error(err)
      }
      return set({ accessToken, refreshToken })
    },
    loadToken: async () => {
      try {
        const accessToken: string | null = await localforage.getItem('accessToken')
        const refreshToken: string | null = await localforage.getItem('refreshToken')
        if (accessToken && refreshToken) {
          return set({ accessToken, refreshToken })
        }

        return set({ accessToken: '', refreshToken: '' })
      }
      catch (err) {
        console.error(err)
      }
    },
    clearToken: async () => {
      set({ accessToken: '', refreshToken: '' })
      await localforage.removeItem('accessToken')
      await localforage.removeItem('refreshToken')
    },
  }), {
    name: 'userInfo',
    enabled: true,
  }),
)
