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
  setAccessToken: (accessToken: string) => void
  setUserInfo: (userInfo: UserInfoStore['userInfo']) => Promise<void>
  clearToken: () => void
}

export const useUserInfo = create<UserInfoStore & UserInfoAction>()(
  devtools(set => ({
    accessToken: sessionStorage.getItem('accessToken') ?? '',
    userInfo: {},
    setAccessToken: (accessToken: string) => set({ accessToken }),
    clearToken: () => set({ accessToken: '' }),
    setUserInfo: async (userInfo: UserInfoStore['userInfo']) => {
      // 更新本地用户信息
      await localforage.setItem('userInfo', userInfo)
      set({ userInfo })
    },
  }), {
    name: 'userInfo',
    enabled: true,
  }),
)
