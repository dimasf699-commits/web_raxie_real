'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Instagram, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export function Footer() {
  const [email, setEmail] = useState('')

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    toast.success('Terima kasih!', 'Anda telah berlangganan newsletter RAXIE.')
    setEmail('')
  }

  return (
    <footer className="bg-[#FAF9F6] dark:bg-neutral-950 text-black dark:text-white border-t border-neutral-200 dark:border-neutral-800 pt-16 pb-8 transition-colors">
      <div className="container-raxie">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 pb-12 border-b border-neutral-200">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 lg:pr-8">
            <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <span className="font-serif font-extrabold text-2xl tracking-[0.05em] text-black dark:text-white uppercase">
                RAXIE
              </span>
            </Link>
            <p className="text-[13px] text-neutral-500 leading-relaxed max-w-xs mt-2">
              RAXIE hadir untuk memberikan produk premium dengan desain modern dan kualitas terbaik untuk Anda.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors text-xs font-bold" aria-label="TikTok">
                🎵
              </a>
              <a href="https://shopee.co.id" target="_blank" rel="noreferrer" className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors text-xs font-bold" aria-label="Shopee">
                🛍️
              </a>
              <a href="https://wa.me" target="_blank" rel="noreferrer" className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm hover:bg-neutral-800 transition-colors text-xs font-bold" aria-label="WhatsApp">
                💬
              </a>
            </div>
          </div>

          {/* Col 2: QUICK LINKS */}
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-black dark:text-white">TAUTAN CEPAT</h2>
            <ul className="space-y-3 text-[13px] text-neutral-500 font-medium">
              <li><Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/products" className="hover:text-black dark:hover:text-white transition-colors">Koleksi</Link></li>
              <li><Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link href="/why-raxie" className="hover:text-black dark:hover:text-white transition-colors">Kenapa Raxie</Link></li>
            </ul>
          </div>

          {/* Col 3: HELP & SUPPORT */}
          <div className="space-y-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-black dark:text-white">BANTUAN & DUKUNGAN</h2>
            <ul className="space-y-3 text-[13px] text-neutral-500 font-medium">
              <li><Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors">Hubungi Kami</Link></li>
              <li><Link href="/faq" className="hover:text-black dark:hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-black dark:hover:text-white transition-colors">Pengiriman & Retur</Link></li>
              <li><Link href="/size-guide" className="hover:text-black dark:hover:text-white transition-colors">Panduan Ukuran</Link></li>
            </ul>
          </div>

          {/* Col 4: NEWSLETTER */}
          <div className="space-y-4 lg:pl-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-black dark:text-white">BERLANGGANAN</h2>
            <p className="text-[13px] text-neutral-500 leading-relaxed font-medium">
              Dapatkan info terbaru dan promo menarik langsung ke email Anda.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 pt-2">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                aria-label="Email untuk newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-sm px-4 py-2.5 text-[13px] text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
              />
              <button
                type="submit"
                className="bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-sm px-4 py-2.5 flex items-center justify-center shrink-0 transition-colors"
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
            <Link href="/privacy-policy" className="hover:text-black transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
