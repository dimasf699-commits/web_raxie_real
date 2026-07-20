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
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tan-500" />
      </div>
    )
  }

  const user = session?.user

  return (
    <div className="container-raxie py-8 md:py-12 min-h-[70vh]">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              {user?.image ? (
                <Image src={user.image} alt={user.name || 'User'} width={48} height={48} className="rounded-full object-cover border-2 border-tan-400" />
              ) : (
                <div className="w-12 h-12 bg-tan-100 text-tan-600 rounded-full flex items-center justify-center font-serif font-bold text-xl uppercase">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-tan-500 text-white shadow-md shadow-tan-500/20" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
              
              <div className="pt-6 mt-6 border-t border-border">
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
