'use client'

import { cn } from '@/lib/utils'

interface Variant {
  id: string
  name: string
  color?: string | null
  colorHex?: string | null
  stock: number
}

interface VariantSelectorProps {
  variants: Variant[]
  selectedVariantId: string | null
  onSelect: (variant: Variant) => void
}

export function VariantSelector({ variants, selectedVariantId, onSelect }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null

  // Group by type (assuming color for now)
  const hasColors = variants.some((v) => v.colorHex)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">
          Pilihan Varian: {variants.find(v => v.id === selectedVariantId)?.name || ''}
        </h4>
      </div>

      <div className="flex flex-wrap gap-3">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id
          const isOutOfStock = variant.stock === 0

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              className={cn(
                'relative flex items-center justify-center rounded-xl border transition-all duration-200',
                hasColors ? 'w-12 h-12 rounded-full' : 'px-4 py-2 text-sm font-medium',
                isSelected
                  ? 'border-tan-400 ring-2 ring-tan-400/20 ring-offset-2 bg-transparent text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-tan-400/50',
                isOutOfStock && 'opacity-50 cursor-not-allowed hover:border-border'
              )}
              title={isOutOfStock ? 'Stok Habis' : variant.name}
            >
              {hasColors && variant.colorHex ? (
                <span
                  className="w-full h-full rounded-full border border-black/10"
                  style={{ backgroundColor: variant.colorHex }}
                />
              ) : (
                <span>{variant.name}</span>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-[1px] bg-red-500/50 rotate-45" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
