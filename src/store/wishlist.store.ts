import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]

  // Actions
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  removeItem: (productId: string) => void
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
  clearWishlist: () => void
  hasItem: (productId: string) => boolean
  totalItems: () => number
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!get().hasItem(item.productId)) {
          set((state) => ({
            items: [
              ...state.items,
              { ...item, addedAt: new Date().toISOString() },
            ],
          }))
        }
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      toggleItem: (item) => {
        if (get().hasItem(item.productId)) {
          get().removeItem(item.productId)
        } else {
          get().addItem(item)
        }
      },

      clearWishlist: () => set({ items: [] }),

      hasItem: (productId) =>
        get().items.some((i) => i.productId === productId),

      totalItems: () => get().items.length,
    }),
    {
      name: 'raxie-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
