'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Instagram, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'
import { STORE_CONFIG } from '@/lib/constants'

export function Footer() {
  const [email, setEmail] = useState('')

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    toast.success('Terima kasih!', 'Anda telah berlangganan newsletter RAXIE.')
    setEmail('')
  }

  return (
    <footer className="bg-[#121212] text-white border-t border-neutral-800 pt-10 lg:pt-16 pb-20 lg:pb-8 transition-colors">
      <div className="container-raxie">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 pb-12 border-b border-neutral-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 lg:pr-8">
            <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <span className="font-serif font-extrabold text-2xl tracking-[0.05em] text-white uppercase">
                RAXIE
              </span>
            </Link>
            <p className="text-[13px] text-neutral-400 leading-relaxed max-w-xs mt-2">
              RAXIE hadir untuk memberikan produk premium dengan desain modern dan kualitas terbaik untuk Anda.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <a href={STORE_CONFIG.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href={STORE_CONFIG.tiktok} target="_blank" rel="noreferrer" className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors text-xs font-bold" aria-label="TikTok">
                🎵
              </a>
              <a href={STORE_CONFIG.shopee} target="_blank" rel="noreferrer" className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors text-xs font-bold" aria-label="Shopee">
                🛍️
              </a>
            </div>
          </div>

          {/* Col 2: QUICK LINKS */}
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white">TAUTAN CEPAT</h2>
            <ul className="space-y-3 text-[13px] text-neutral-400 font-medium">
              <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/products" className="hover:text-white transition-colors">Koleksi</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
            </ul>
          </div>

          {/* Col 3: HELP & SUPPORT */}
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white">BANTUAN & DUKUNGAN</h2>
            <ul className="space-y-3 text-[13px] text-neutral-400 font-medium">
              <li><Link href="/contact" className="hover:text-white transition-colors">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition-colors">Pengiriman & Retur</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Panduan Ukuran</Link></li>
            </ul>
          </div>

          {/* Col 4: NEWSLETTER */}
          <div className="space-y-4 lg:pl-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-white">BERLANGGANAN</h2>
            <p className="text-[13px] text-neutral-400 leading-relaxed font-medium">
              Dapatkan info terbaru dan promo menarik langsung ke email Anda.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 pt-2">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                aria-label="Email untuk newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-sm px-4 py-2.5 text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:border-white focus-visible:ring-1 focus-visible:ring-white"
              />
              <button
                type="submit"
                className="bg-white hover:bg-neutral-200 text-black rounded-sm px-4 py-2.5 flex items-center justify-center shrink-0 transition-colors"
                aria-label="Submit newsletter"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-neutral-500 font-medium">
          <p>© 2026 RAXIE. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
