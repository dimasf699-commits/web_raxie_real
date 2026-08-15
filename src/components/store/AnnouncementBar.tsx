'use client'
import { Truck } from 'lucide-react'

export function AnnouncementBar() {
  return (
    <div className="bg-[#0B0B0B] text-[#B89A6A] text-[9px] md:text-[11px] font-bold tracking-[0.15em] uppercase py-2.5 px-4 flex items-center justify-center gap-2 text-center">
      <Truck className="w-3.5 h-3.5" />
      <span>GRATIS ONGKIR SELURUH INDONESIA</span>
    </div>
  )
}
