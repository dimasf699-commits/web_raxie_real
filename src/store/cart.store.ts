import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string           // variantId or productId if no variant
  productId: string
  variantId?: string
  name: string
  variantName?: string
  slug: string
  price: number
  image: string
  quantity: number
  stock: number
  sku: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void

  // Derived
  totalItems: () => number
  totalPrice: () => number
  hasItem: (id: string) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          const newQty = Math.min(
            existing.quantity + (item.quantity ?? 1),
            item.stock
          )
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: newQty } : i
            ),
          }))
        } else {
          set((state) => ({
            items: [
              ...state.items,
              { ...item, quantity: item.quantity ?? 1 },
            ],
          }))
        }
        // Open cart drawer
        set({ isOpen: true })
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        const item = get().items.find((i) => i.id === id)
        if (!item) return
        const clampedQty = Math.min(quantity, item.stock)
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: clampedQty } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'raxie-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
