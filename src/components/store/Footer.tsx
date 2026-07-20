'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { toast } from '@/components/ui/Toaster'

const footerLinks = {
  shop: [
    { href: '/products', label: 'Semua Produk' },
    { href: '/products?category=dompet', label: 'Dompet' },
    { href: '/products?category=aksesoris', label: 'Aksesoris' },
    { href: '/products?isNew=true', label: 'Produk Baru' },
    { href: '/products?isBestSeller=true', label: 'Best Seller' },
  ],
  info: [
    { href: '/about', label: 'Tentang Raxie' },
    { href: '/blog', label: 'Journal / Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Hubungi Kami' },
    { href: '/store-locator', label: 'Toko Kami' },
  ],
  policy: [
    { href: '/shipping-policy', label: 'Kebijakan Pengiriman' },
    { href: '/return-policy', label: 'Kebijakan Retur' },
    { href: '/privacy-policy', label: 'Kebijakan Privasi' },
    { href: '/terms', label: 'Syarat & Ketentuan' },
    { href: '/size-guide', label: 'Panduan Ukuran' },
  ],
}

const socialLinks = [
  { icon: Instagram, href: 'https://instagram.com/raxie.id', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/raxie.id', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com/raxieid', label: 'Twitter / X' },
  { icon: Youtube, href: 'https://youtube.com/@raxie', label: 'YouTube' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800)) // Simulate API
    toast.success('Berhasil berlangganan!', 'Terima kasih telah bergabung dengan newsletter Raxie.')
    setEmail('')
    setLoading(false)
  }

  return (
    <footer className="bg-charcoal-900 text-ivory-200 mt-24">
      {/* Newsletter Banner */}
      <div className="bg-tan-400">
        <div className="container-raxie py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-white">
                Jadi yang pertama tahu koleksi baru
              </h2>
              <p className="mt-1 text-tan-100 text-sm">
                Daftarkan email & dapatkan diskon 10% untuk pembelian pertama.
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alamat@email.com"
                required
                className="flex-1 md:w-72 px-4 py-2.5 rounded-lg bg-white/15 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
              <Button
                type="submit"
                loading={loading}
                className="bg-charcoal-900 text-ivory-100 hover:bg-charcoal-800 border-0"
              >
                Daftar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-raxie py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10"
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="font-serif font-bold text-3xl text-ivory-100">
                Raxie
              </span>
            </Link>
            <p className="mt-4 text-charcoal-400 text-sm leading-relaxed max-w-xs">
              Dompet & aksesoris kulit premium buatan tangan. Setiap produk
              dibuat dengan material pilihan dan keahlian pengrajin terbaik
              Indonesia.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              <a
                href="mailto:hello@raxie.id"
                className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-tan-400 transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@raxie.id
              </a>
              <a
                href="tel:+6281234567890"
                className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-tan-400 transition-colors"
              >
                <Phone className="h-4 w-4" />
                +62 812-3456-7890
              </a>
              <div className="flex items-center gap-2 text-sm text-charcoal-400">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                Jl. Kemang Raya No. 12, Jakarta Selatan
              </div>
            </div>

            {/* Social */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:bg-tan-400 hover:text-white transition-all duration-200"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Shop */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-ivory-100 mb-4">Belanja</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-400 hover:text-tan-400 transition-colors underline-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Info */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-ivory-100 mb-4">Informasi</h3>
            <ul className="space-y-2.5">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-400 hover:text-tan-400 transition-colors underline-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Policy */}
          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-ivory-100 mb-4">Kebijakan</h3>
            <ul className="space-y-2.5">
              {footerLinks.policy.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-charcoal-400 hover:text-tan-400 transition-colors underline-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Payment Methods + Copyright */}
      <div className="border-t border-charcoal-800">
        <div className="container-raxie py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-500">
            © {new Date().getFullYear()} Raxie. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-2 text-xs text-charcoal-500">
            <span>Pembayaran aman via</span>
            <div className="flex items-center gap-2">
              {['VISA', 'MC', 'GoPay', 'OVO', 'QRIS'].map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded bg-charcoal-800 text-charcoal-400 text-[10px] font-semibold"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
