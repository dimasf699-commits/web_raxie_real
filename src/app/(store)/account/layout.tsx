'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, MapPin, Heart, LogOut, LayoutDashboard, Loader2 } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/account', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Pesanan Saya', icon: Package },
  { href: '/account/profile', label: 'Profil & Keamanan', icon: User },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/addresses', label: 'Buku Alamat', icon: MapPin },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    },
  })

  if (status === 'loading') {
    return (
      <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-[70vh] flex items-center justify-center transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19A6B]" />
      </div>
    )
  }

  const user = session?.user

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white min-h-screen py-10 transition-colors duration-300">
      <div className="container-raxie">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Nav (Desktop) / Horizontal Tabs (Mobile) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 lg:p-6 lg:sticky lg:top-24 space-y-4 lg:space-y-6 shadow-sm">
              <div className="flex items-center gap-3.5 pb-3 lg:pb-4 border-b border-neutral-200 dark:border-neutral-800">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || 'User'} width={40} height={40} className="rounded-full object-cover border-2 border-[#C19A6B]" />
                ) : (
                  <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-900 border border-[#C19A6B] text-[#C19A6B] rounded-full flex items-center justify-center font-serif font-bold text-base uppercase shrink-0">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="font-bold text-xs uppercase tracking-wider text-black dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Horizontal Scroll on Mobile, Vertical Stack on Desktop */}
              <nav className="flex lg:flex-col overflow-x-auto scrollbar-hide gap-1 pb-1 lg:pb-0">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 lg:gap-3 px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 whitespace-nowrap",
                        isActive 
                          ? "bg-[#121212] dark:bg-white text-white dark:text-black" 
                          : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      {item.label}
                    </Link>
                  )
                })}
                
                <div className="hidden lg:block pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-sm text-[11px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 md:p-8 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
