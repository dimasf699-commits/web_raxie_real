import { create } from 'zustand'

interface QuickViewState {
  productId: string | null
  initialData?: any
  isOpen: boolean
  openQuickView: (productId: string, initialData?: any) => void
  closeQuickView: () => void
}

export const useQuickViewStore = create<QuickViewState>((set) => ({
  productId: null,
  initialData: null,
  isOpen: false,
  openQuickView: (productId: string, initialData?: any) => set({ productId, initialData, isOpen: true }),
  closeQuickView: () => set({ productId: null, initialData: null, isOpen: false }),
}))
