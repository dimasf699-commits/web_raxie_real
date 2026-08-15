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

export type WishlistInputItem = {
  productId?: string
  id?: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image?: string
  images?: Array<{ url: string } | string>
}

interface WishlistState {
  items: WishlistItem[]

  // Actions
  addItem: (item: WishlistInputItem) => void
  removeItem: (productIdOrId: string) => void
  toggleItem: (item: WishlistInputItem) => void
  clearWishlist: () => void
  hasItem: (productIdOrId: string) => boolean
  totalItems: () => number
}

function resolveProductId(item: WishlistInputItem | string): string {
  if (typeof item === 'string') return item
  return item.productId || item.id || ''
}

function resolveProductImage(item: WishlistInputItem): string {
  if (item.image) return item.image
  if (item.images && item.images.length > 0) {
    const first = item.images[0]
    return typeof first === 'string' ? first : first.url
  }
  return 'https://i.imgur.com/1QtzAZ5.png'
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const pid = resolveProductId(item)
        if (!pid) return

        if (!get().hasItem(pid)) {
          const normalized: WishlistItem = {
            productId: pid,
            name: item.name,
            slug: item.slug,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            image: resolveProductImage(item),
            addedAt: new Date().toISOString(),
          }
          set((state) => ({
            items: [...state.items, normalized],
          }))
        }
      },

      removeItem: (productIdOrId) => {
        const pid = resolveProductId(productIdOrId)
        set((state) => ({
          items: state.items.filter((i) => i.productId !== pid),
        }))
      },

      toggleItem: (item) => {
        const pid = resolveProductId(item)
        if (!pid) return
        if (get().hasItem(pid)) {
          get().removeItem(pid)
        } else {
          get().addItem(item)
        }
      },

      clearWishlist: () => set({ items: [] }),

      hasItem: (productIdOrId) => {
        const pid = resolveProductId(productIdOrId)
        return get().items.some((i) => i.productId === pid)
      },

      totalItems: () => get().items.length,
    }),
    {
      name: 'raxie-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
