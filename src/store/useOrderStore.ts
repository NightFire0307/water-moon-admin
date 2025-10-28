import type { IOrder } from '@/types/order'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface OrderState {
  orderInfo: IOrder | null
}

interface OrderAction {
  setOrderInfo: (order: IOrder | null) => void
}

export const useOrderStore = create<OrderState & OrderAction>()(
  devtools(set => ({
    orderInfo: null,
    setOrderInfo: (order: IOrder | null) => set({ orderInfo: order }),
  }), {
    name: 'orderStore',
  }),
)
