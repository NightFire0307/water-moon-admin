import { generateShareLink } from '@/apis/link.ts'
import dayjs from 'dayjs'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ShareLinkInfo {
  share_url: string
  share_password: string
  expired_at: string
}

interface ShareLinkState {
  shareLinkInfo: ShareLinkInfo
}

interface ShareLinkAction {
  createShareUrl: (order_id: number, access_password: string, expired_at: number) => void
}

export const useShareLink = create<ShareLinkState & ShareLinkAction>()(
  devtools(set => ({
    shareLinkInfo: {
      share_url: '',
      share_password: '',
      expired_at: '',
    },
    createShareUrl: async (order_id, access_password, expired_at) => {
      const { data } = await generateShareLink({
        order_id,
        password: access_password,
        expired_at: expired_at === 0 ? expired_at : dayjs().add(expired_at, 'day').unix(),
      })
      console.log(data)

      set({
        shareLinkInfo: {
          share_url: data.share_url,
          share_password: data.share_password,
          expired_at: data.expired_at,
        },
      })
    },
  }), {
    enabled: true,
  }),
)
