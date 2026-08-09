'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Instagram, Send } from 'lucide-react'
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
    <footer className="bg-[#0B0A08] text-white border-t border-neutral-900 pt-16 pb-8">
      <div className="container-raxie">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-neutral-900">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <Image
                src="https://i.imgur.com/SrBEKD5.png"
                alt="RAXIE Emblem"
                width={36}
                height={36}
                className="h-7 w-auto object-contain shrink-0"
              />
              <span className="font-serif font-extrabold text-xl tracking-[0.2em] text-[#C19A6B] uppercase">
                RAXIE
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              RAXIE adalah brand lokal yang berkomitmen untuk menghadirkan produk aksesoris kulit sintetis PU Leather premium dengan desain elegan dan kualitas terbaik.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#C19A6B] hover:border-[#C19A6B] transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#C19A6B] hover:border-[#C19A6B] transition-colors text-xs font-bold" aria-label="TikTok">
                🎵
              </a>
              <a href="https://shopee.co.id" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#C19A6B] hover:border-[#C19A6B] transition-colors text-xs font-bold" aria-label="Shopee">
                🛍️
              </a>
              <a href="https://wa.me" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#C19A6B] hover:border-[#C19A6B] transition-colors text-xs font-bold" aria-label="WhatsApp">
                💬
              </a>
            </div>
          </div>

          {/* Col 2: INFORMASI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white">INFORMASI</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/about" className="hover:text-[#C19A6B] transition-colors">Tentang Kami</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#C19A6B] transition-colors">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="hover:text-[#C19A6B] transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#C19A6B] transition-colors">Pengembalian Barang</Link></li>
              <li><Link href="/faq" className="hover:text-[#C19A6B] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Col 3: KATEGORI */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white">KATEGORI</h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link href="/products?category=dompet" className="hover:text-[#C19A6B] transition-colors">Dompet</Link></li>
              <li><Link href="/products?category=tas" className="hover:text-[#C19A6B] transition-colors">Tas</Link></li>
              <li><Link href="/products?category=sabuk" className="hover:text-[#C19A6B] transition-colors">Belt</Link></li>
              <li><Link href="/products" className="hover:text-[#C19A6B] transition-colors">Semua Produk</Link></li>
            </ul>
          </div>

          {/* Col 4: NEWSLETTER */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-white">NEWSLETTER</h3>
            <p className="text-xs text-neutral-400">
              Dapatkan info terbaru dan promo eksklusif dari RAXIE.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121212] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C19A6B]"
              />
              <button
                type="submit"
                className="bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold rounded-lg px-3 py-2 flex items-center justify-center shrink-0 transition-colors"
                aria-label="Submit newsletter"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright & payment icons */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© 2026 RAXIE. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span>BCA</span>
            <span>Mandiri</span>
            <span>BRI</span>
            <span>QRIS</span>
            <span>Midtrans</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
