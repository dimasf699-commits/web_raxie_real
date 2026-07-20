import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CompareProduct {
  id: string
  name: string
  slug: string
  price: number
  image: string
  material?: string
  dimensions?: string
  weight?: number
  avgRating?: number
}

interface CompareState {
  items: CompareProduct[]
  isOpen: boolean

  // Actions
  addItem: (item: CompareProduct) => void
  removeItem: (id: string) => void
  clearCompare: () => void
  toggleCompare: () => void
  openCompare: () => void
  closeCompare: () => void
  hasItem: (id: string) => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get()
        if (items.length >= 4) return // Max 4 items
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [...items, item], isOpen: true })
        } else {
          set({ isOpen: true }) // Just open if already exists
        }
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearCompare: () => set({ items: [] }),
      toggleCompare: () => set((state) => ({ isOpen: !state.isOpen })),
      openCompare: () => set({ isOpen: true }),
      closeCompare: () => set({ isOpen: false }),

      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'raxie-compare',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
