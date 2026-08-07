'use client'

import React, { useState } from 'react'
import { Sparkles, X, ShieldCheck, Tag } from 'lucide-react'

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-200 text-xs py-2 px-4 border-b border-amber-900/50 flex items-center justify-between font-medium tracking-wide">
      <div className="flex-1 flex items-center justify-center gap-3 overflow-hidden text-center">
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider shrink-0">
          <Tag className="w-3 h-3" /> PROMO MOUNT
        </span>
        <p className="truncate text-[11px] sm:text-xs">
          ✨ Gunakan Kode Voucher di Checkout | Garansi 100% Produk Leather Goods Asli Garut
        </p>
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold border-l border-amber-800 pl-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Kualitas PU Leather Premium
        </span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="text-amber-400/70 hover:text-amber-200 p-0.5 rounded-md hover:bg-amber-900/40 transition-colors shrink-0 ml-2"
        aria-label="Tutup Pengumuman"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
