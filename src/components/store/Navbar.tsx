'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
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
  Bell,
  LogOut,
  ArrowRight
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'
import { useWishlistStore } from '@/store/wishlist.store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const defaultNavLinks = [
  { href: '/products', label: 'Semua Koleksi' },
  { href: '/blog', label: 'Journal' },
  { href: '/about', label: 'Tentang' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [navLinks, setNavLinks] = useState<any[]>(defaultNavLinks)

  useEffect(() => {
    setIsMounted(true)
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        const cats = await res.json()
        if (cats && cats.length > 0) {
          const categoryLinks = cats.map((c: any) => ({
            href: `/products?category=${c.slug}`,
            label: c.name
          }))
          setNavLinks([
            { href: '/products', label: 'Semua Koleksi' },
            ...categoryLinks,
            { href: '/blog', label: 'Journal' },
            { href: '/about', label: 'Tentang' }
          ])
        }
      } catch (error) {}
    }
    fetchCategories()
  }, [])
  const searchRef = useRef<HTMLInputElement>(null)
  const cartItems = useCartStore((s) => s.totalItems())
  const wishlistItems = useWishlistStore((s) => s.totalItems())
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
    setIsSearchOpen(false)
  }, [pathname])

  const isAdmin = pathname.startsWith('/admin')
  if (isAdmin) return null

  return (
    <>
      {/* Main Navbar */}
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl shadow-sm border-b border-border'
            : 'bg-transparent'
        )}
        initial={false}
        animate={{ height: isScrolled ? 56 : 64 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="container-raxie h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-serif font-bold text-2xl tracking-tight text-foreground hover:text-tan-400 transition-colors"
          >
            <motion.span
              animate={{ fontSize: isScrolled ? '1.35rem' : '1.5rem' }}
              transition={{ duration: 0.3 }}
            >
              Raxie
            </motion.span>
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
                    'flex items-center gap-0.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    'hover:text-tan-400 hover:bg-tan-50 dark:hover:bg-tan-900/10',
                    pathname === link.href || pathname.startsWith(link.href + '?')
                      ? 'text-tan-500'
                      : 'text-foreground/80'
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
                      className="absolute top-full left-0 mt-1 w-52 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-1"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center px-4 py-2.5 text-sm text-foreground/80 hover:text-tan-500 hover:bg-tan-50 dark:hover:bg-tan-900/10 transition-colors"
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
              size="icon-sm"
              aria-label="Cari produk"
              onClick={() => setIsSearchOpen(true)}
              className="text-foreground/70 hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle tema"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-foreground/70 hover:text-foreground hidden sm:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Wishlist"
              asChild
              className="text-foreground/70 hover:text-foreground relative hidden sm:flex"
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
              size="icon-sm"
              aria-label="Keranjang belanja"
              onClick={openCart}
              className="text-foreground/70 hover:text-foreground relative"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {isMounted && cartItems > 0 && (
                  <motion.span
                    key={cartItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-tan-400 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {cartItems > 9 ? '9+' : cartItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>

            {/* Account — auth-aware */}
            <div className="relative hidden sm:block">
              {session ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-tan-400 flex items-center justify-center bg-tan-100 text-tan-700 font-bold text-sm hover:border-tan-500 transition-colors"
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
                        onMouseLeave={() => setShowUserMenu(false)}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-card border border-border shadow-xl overflow-hidden py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-border mb-1">
                          <p className="font-semibold text-sm text-foreground truncate">{session.user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                        </div>
                        <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-tan-500 hover:bg-tan-50 dark:hover:bg-tan-900/10 transition-colors">
                          <User className="w-4 h-4" /> Dasbor Saya
                        </Link>
                        <Link href="/account/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-tan-500 hover:bg-tan-50 dark:hover:bg-tan-900/10 transition-colors">
                          <ShoppingBag className="w-4 h-4" /> Pesanan Saya
                        </Link>
                        <div className="border-t border-border mt-1 pt-1">
                          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                            <LogOut className="w-4 h-4" /> Keluar
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
                  className="text-foreground/70 hover:text-foreground"
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
              size="icon-sm"
              aria-label="Menu"
              onClick={() => setIsMobileOpen(true)}
              className="text-foreground/70 hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border-b border-border shadow-2xl relative"
            >
              <div className="container-raxie py-4">
                <div className="relative flex items-center gap-3">
                  <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder="Cari dompet, aksesoris kulit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-foreground text-lg placeholder:text-muted-foreground outline-none"
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
                    onClick={() => setIsSearchOpen(false)}
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
                    className="absolute top-full left-0 right-0 bg-card border-b border-border shadow-2xl overflow-hidden z-50"
                  >
                    <div className="container-raxie max-h-[60vh] overflow-y-auto py-2">
                      {isSearching ? (
                        <div className="py-8 text-center flex flex-col items-center">
                          <div className="w-6 h-6 border-2 border-tan-200 border-t-tan-500 rounded-full animate-spin mb-2" />
                          <span className="text-sm text-muted-foreground">Mencari produk...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-4">
                          {searchResults.map((item) => (
                            <Link 
                              key={item.id} 
                              href={`/products/${item.slug}`}
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center gap-4 p-3 hover:bg-muted rounded-xl transition-colors group"
                            >
                              <div className="w-16 h-16 bg-tan-50 rounded-lg overflow-hidden border border-border relative flex-shrink-0">
                                {item.image ? (
                                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">No Img</div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm group-hover:text-tan-600 transition-colors">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.category}</p>
                                <p className="text-sm font-bold mt-1 text-tan-600">{formatPrice(item.price)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <p className="text-muted-foreground">Tidak ditemukan hasil untuk "{searchQuery}"</p>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="py-4 border-t border-border mt-2">
                          <Link 
                            href={`/products?q=${encodeURIComponent(searchQuery)}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="text-sm font-bold text-tan-600 hover:text-tan-500 flex items-center justify-center gap-2 group"
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

      {/* Mobile Side Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-card shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <span className="font-serif font-bold text-xl">Raxie</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center px-5 py-3 text-base font-medium transition-colors',
                        pathname === link.href
                          ? 'text-tan-500 bg-tan-50 dark:bg-tan-900/10'
                          : 'text-foreground/80 hover:text-tan-500 hover:bg-muted'
                      )}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <div className="pl-4 border-l-2 border-border ml-5 mb-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center px-4 py-2 text-sm text-foreground/70 hover:text-tan-500 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="p-5 border-t border-border space-y-3">
                <Link href="/account">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    Akun Saya
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-4 w-4 dark:hidden" />
                  <Moon className="h-4 w-4 hidden dark:block" />
                  {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className={cn('transition-all duration-300', isScrolled ? 'h-14' : 'h-16')} />
    </>
  )
}

// ─── Mobile Bottom Navigation ─────────────────────────────────────────────────

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
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-tan-400 text-white text-[10px] font-bold flex items-center justify-center">
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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border pb-safe lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, idx) =>
          item.onClick ? (
            <button
              key={idx}
              onClick={item.onClick}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-muted-foreground hover:text-tan-400 transition-colors"
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ) : (
            <Link
              key={idx}
              href={item.href!}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors',
                pathname === item.href
                  ? 'text-tan-400'
                  : 'text-muted-foreground hover:text-tan-400'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
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
