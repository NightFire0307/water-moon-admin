import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ShareLinkInfo {
  short_url: string
  password: string
  expired_at: string
}

interface ShareLinkState {
  shareLinkInfo: ShareLinkInfo
}

interface ShareLinkAction {
  generateShareUrl: () => void
}

export const useShareLink = create<ShareLinkState & ShareLinkAction>()(
  devtools(set => ({
    shareLinkInfo: {
      short_url: '',
      password: '',
      expired_at: '',
    },
    generateShareUrl: () => {},
  }), {
    enabled: true,
  }),
)
