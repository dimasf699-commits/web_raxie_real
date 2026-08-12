'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, PackageSearch, ShoppingCart, Users, Tag, Settings, LogOut, MessageSquare, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Pesanan', icon: ShoppingCart },
  { href: '/admin/products', label: 'Produk', icon: PackageSearch },
  { href: '/admin/chat', label: 'Customer Support', icon: MessageSquare },
  { href: '/admin/customers', label: 'Pelanggan', icon: Users },
  { href: '/admin/vouchers', label: 'Voucher', icon: Tag },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#F8F9FA] dark:bg-background overflow-hidden font-sans relative">
      
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div>
            <span className="font-serif font-bold text-2xl tracking-widest text-white">RAXIE<span className="text-tan-500">.</span></span>
            <span className="ml-2 text-[10px] font-bold tracking-widest uppercase bg-tan-500/20 text-tan-400 px-2 py-0.5 rounded">Admin</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <p className="text-xs font-semibold text-slate-500 mb-4 px-2 tracking-wider">MENU UTAMA</p>
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-tan-500 text-white shadow-lg shadow-tan-500/20" 
                      : "hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden shrink-0">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="Avatar" width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                  {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{session?.user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{session?.user?.email ?? ''}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white dark:bg-card border-b border-slate-200 dark:border-border flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-slate-800 dark:text-white truncate">
              {adminNav.find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm font-medium text-tan-600 hover:underline">
              Lihat Website &nearr;
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  )
}
