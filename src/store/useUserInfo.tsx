import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UserInfoStore {
  accessToken: string
  refreshToken: string
}

interface UserInfoAction {
  updateToken: (accessToken: string, refreshToken: string) => void
}

export const useUserInfo = create<UserInfoStore & UserInfoAction>()(
  devtools(set => ({
    token: '',
    updateToken: (accessToken: string, refreshToken: string) => set({ accessToken, refreshToken }),
  }), {
    name: 'userInfo',
    enabled: true,
  }),
)
