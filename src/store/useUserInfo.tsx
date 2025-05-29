import * as localforage from 'localforage'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface UserInfoStore {
  userInfo: {
    userId: number
    username: string
    nickname: string
    roles: string[]
    permissions: string[]
  }
  accessToken: string
}

interface UserInfoAction {
  saveToken: (accessToken: string) => Promise<void>
  saveUserInfo: (userInfo: UserInfoStore['userInfo']) => Promise<void>
  loadToken: () => Promise<void>
  clearToken: () => Promise<void>
}

export const useUserInfo = create<UserInfoStore & UserInfoAction>()(
  devtools(set => ({
    accessToken: '',
    userInfo: {},
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
    saveUserInfo: async (userInfo: UserInfoStore['userInfo']) => {
      // 更新本地用户信息
      await localforage.setItem('userInfo', userInfo)
      set({ userInfo })
    },
  }), {
    name: 'userInfo',
    enabled: true,
  }),
)
