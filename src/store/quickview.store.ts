import { create } from 'zustand'

interface QuickViewState {
  productId: string | null
  isOpen: boolean
  openQuickView: (productId: string) => void
  closeQuickView: () => void
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  productId: null,
  isOpen: false,
  openQuickView: (productId: string) => set({ productId, isOpen: true }),
  closeQuickView: () => set({ productId: null, isOpen: false }),
}))
