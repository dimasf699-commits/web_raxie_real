'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  ArrowRight
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { cn } from '@/lib/utils'
import { AnnouncementBar } from '@/components/store/AnnouncementBar'
import { Button } from '@/components/ui/Button'

const defaultNavLinks = [
  { href: '/', label: 'BERANDA' },
  { 
    href: '/products', 
    label: 'KOLEKSI',
    children: [
      { href: '/products?category=dompet', label: 'Dompet' },
      { href: '/products?category=tas', label: 'Tas' },
      { href: '/products?category=sabuk', label: 'Belt' },
    ]
  },
  { href: '/about', label: 'TENTANG KAMI' },
  { href: '/blog', label: 'JOURNAL' },
  { href: '/contact', label: 'KONTAK' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [navLinks] = useState<any[]>(defaultNavLinks)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  const searchRef = useRef<HTMLInputElement>(null)
  const cartItems = useCartStore((s) => s.totalItems())
  const wishlistItems = useWishlistStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setIsMobileOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <>
      {/* Permanent Luxury Dark Sticky Navbar Header */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-black text-white border-b border-neutral-900">
        <AnnouncementBar />
        <div className="container-raxie h-16 flex items-center justify-between">
          {/* Logo with Emblem Image + RAXIE Title */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group">
            <Image
              src="https://i.imgur.com/SrBEKD5.png"
              alt="RAXIE Emblem"
              width={40}
              height={40}
              className="h-8 md:h-9 w-auto object-contain shrink-0"
              priority
            />
            <span className="font-serif font-extrabold text-xl md:text-2xl tracking-[0.2em] text-[#C19A6B] uppercase">
              RAXIE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && setOpenDropdown(link.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 text-[12px] font-bold tracking-[0.15em] uppercase transition-colors',
                    'hover:text-[#C19A6B]',
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                      ? 'text-[#C19A6B] border-b border-[#C19A6B]'
                      : 'text-neutral-300'
                  )}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform duration-200',
                        openDropdown === link.href && 'rotate-180'
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && openDropdown === link.href && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 w-52 rounded-none bg-black border border-neutral-800 shadow-2xl overflow-hidden py-1"
                    >
                      {link.children.map((child: any) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center px-4 py-2.5 text-xs font-bold text-neutral-300 hover:text-[#C19A6B] hover:bg-neutral-900 transition-colors uppercase tracking-wider"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cari produk"
              onClick={() => setIsSearchOpen(true)}
              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle tema tampilan"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900 hidden sm:flex"
            >
              {isMounted && theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-200" />
              )}
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Lihat wishlist simpanan"
              asChild
              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900 relative hidden sm:flex"
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {isMounted && wishlistItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {wishlistItems > 9 ? '9+' : wishlistItems}
                  </motion.span>
                )}
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Keranjang belanja"
              onClick={openCart}
              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900 relative"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {isMounted && cartItems > 0 && (
                  <motion.span
                    key={cartItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#C19A6B] text-black text-[10px] font-bold flex items-center justify-center"
                  >
                    {cartItems > 9 ? '9+' : cartItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Account */}
            <div className="relative hidden sm:block">
              {session ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#C19A6B] flex items-center justify-center bg-black text-[#C19A6B] font-bold text-xs hover:border-amber-300 transition-colors"
                    aria-label="Menu akun"
                  >
                    {session.user?.image ? (
                      <Image src={session.user.image} alt="Avatar" width={32} height={32} className="object-cover" />
                    ) : (
                      session.user?.name?.[0]?.toUpperCase() ?? 'U'
                    )}
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-none bg-black border border-neutral-800 text-white shadow-2xl overflow-hidden py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-neutral-800">
                          <p className="text-xs font-bold text-white truncate uppercase">{session.user?.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{session.user?.email}</p>
                        </div>

                        {(session.user as any)?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#C19A6B] uppercase hover:bg-neutral-900 transition-colors"
                          >
                            ⚡ Dashboard Admin
                          </Link>
                        )}

                        <Link
                          href="/account"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                        >
                          <User className="w-3.5 h-3.5" /> Profil & Pesanan
                        </Link>

                        <div className="border-t border-neutral-800 my-1">
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              signOut({ callbackUrl: '/' })
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase text-red-400 hover:bg-neutral-900 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Login"
                  asChild
                  className="text-slate-200 hover:text-amber-400 hover:bg-slate-900"
                >
                  <Link href="/login">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buka menu navigasi"
              onClick={() => setIsMobileOpen(true)}
              className="text-slate-200 hover:text-amber-400 hover:bg-slate-900 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border-b border-neutral-800 shadow-2xl relative"
            >
              <div className="container-raxie py-4">
                <div className="relative flex items-center gap-3">
                  <Search className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="search"
                    aria-label="Cari produk"
                    placeholder="Cari dompet, tas, sabuk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white text-base placeholder:text-neutral-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery) {
                        window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`
                      }
                      if (e.key === 'Escape') setIsSearchOpen(false)
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Tutup pencarian"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-white hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {(searchQuery.length >= 2) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="absolute top-full left-0 right-0 bg-black border-b border-neutral-800 shadow-2xl overflow-hidden z-50"
                  >
                    <div className="container-raxie max-h-[60vh] overflow-y-auto py-2">
                      {isSearching ? (
                        <div className="py-8 text-center flex flex-col items-center">
                          <div className="w-6 h-6 border-2 border-neutral-700 border-t-[#C19A6B] rounded-full animate-spin mb-2" />
                          <span className="text-xs text-neutral-400">Mencari produk...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-4">
                          {searchResults.map((item) => (
                            <Link 
                              key={item.id} 
                              href={`/products/${item.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-4 p-3 hover:bg-neutral-900 transition-colors group border-b border-neutral-900/50 last:border-b-0"
                            >
                              <div className="w-14 h-14 bg-neutral-900 overflow-hidden border border-neutral-800 relative flex-shrink-0">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[10px]">No Img</div>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs uppercase group-hover:text-[#C19A6B] transition-colors">{item.name}</p>
                                <p className="text-[10px] text-neutral-400 uppercase">{item.category}</p>
                                <p className="text-xs font-bold mt-1 text-[#C19A6B]">{formatPrice(item.price)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <p className="text-xs text-neutral-400">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="py-4 border-t border-neutral-800 mt-2">
                          <Link 
                            href={`/products?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="text-xs font-bold text-[#C19A6B] hover:text-[#b08b5c] uppercase flex items-center justify-center gap-2 group tracking-wider"
                          >
                            Lihat Semua Hasil
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-4/5 max-w-sm h-full bg-black border-r border-neutral-800 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                  <Link
                    href="/"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <Image
                      src="https://i.imgur.com/SrBEKD5.png"
                      alt="RAXIE Emblem"
                      width={32}
                      height={32}
                      className="h-7 w-auto object-contain shrink-0"
                    />
                    <span className="font-serif font-extrabold text-xl tracking-[0.2em] text-[#C19A6B] uppercase">
                      RAXIE
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Tutup menu"
                    onClick={() => setIsMobileOpen(false)}
                    className="text-neutral-400 hover:text-white focus-visible:ring-2 focus-visible:ring-[#C19A6B]"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="mt-6 space-y-3">
                  {navLinks.map((link) => (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          'block py-2 text-sm font-bold tracking-wider uppercase transition-colors',
                          pathname === link.href ? 'text-[#C19A6B]' : 'text-neutral-300'
                        )}
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="pl-4 space-y-2 mt-1 border-l border-neutral-800">
                          {link.children.map((child: any) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block text-xs font-semibold text-neutral-400 hover:text-[#C19A6B]"
                              onClick={() => setIsMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-6 border-t border-neutral-800">
                {session ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white uppercase">{session.user?.name}</p>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileOpen(false)}
                      className="block text-xs text-[#C19A6B] font-bold uppercase"
                    >
                      Profil Saya &rarr;
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="block w-full text-center bg-[#C19A6B] text-black font-bold text-xs uppercase py-3 rounded-none hover:bg-[#A8835A] transition-colors"
                  >
                    MASUK AKUN
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const cartItems = useCartStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (isAdmin) return null

  const navItems = [
    { href: '/', icon: <HomeIcon />, label: 'Home' },
    { href: '/products', icon: <Search className="h-5 w-5" />, label: 'Cari' },
    {
      icon: (
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {isMounted && cartItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#C19A6B] text-black text-[10px] font-bold flex items-center justify-center">
              {cartItems > 9 ? '9+' : cartItems}
            </span>
          )}
        </div>
      ),
      label: 'Keranjang',
      onClick: openCart,
    },
    { href: '/account', icon: <User className="h-5 w-5" />, label: 'Akun' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/95 backdrop-blur-xl border-t border-neutral-900 pb-safe lg:hidden text-white">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, idx) =>
          item.onClick ? (
            <button
              key={idx}
              onClick={item.onClick}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-neutral-400 hover:text-[#C19A6B] transition-colors"
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </button>
          ) : (
            <Link
              key={idx}
              href={item.href!}
              className={cn(
                'flex flex-col items-[#C19A6B] gap-0.5 px-4 py-1.5 transition-colors',
                pathname === item.href
                  ? 'text-[#C19A6B]'
                  : 'text-neutral-400 hover:text-[#C19A6B]'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </Link>
          )
        )}
      </div>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
