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

export interface AppliedVoucher {
  id: string
  code: string
  name: string
  type?: string
  discountAmount: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  appliedVoucher: AppliedVoucher | null

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setAppliedVoucher: (voucher: AppliedVoucher | null) => void
  removeVoucher: () => void

  // Derived
  totalItems: () => number
  totalPrice: () => number
  discountAmount: () => number
  finalPrice: () => number
  hasItem: (id: string) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedVoucher: null,

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

      clearCart: () => set({ items: [], appliedVoucher: null }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      setAppliedVoucher: (voucher) => set({ appliedVoucher: voucher }),
      removeVoucher: () => set({ appliedVoucher: null }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      discountAmount: () => {
        const voucher = get().appliedVoucher
        return voucher ? voucher.discountAmount : 0
      },

      finalPrice: () => {
        const subtotal = get().totalPrice()
        const discount = get().discountAmount()
        return Math.max(0, subtotal - discount)
      },

      hasItem: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'raxie-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
