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
      <div className="bg-background text-foreground min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C19A6B]" />
      </div>
    )
  }

  const user = session?.user

  return (
    <div className="bg-background text-foreground min-h-screen py-10 transition-colors duration-300">
      <div className="container-raxie">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Nav */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                {user?.image ? (
                  <Image src={user.image} alt={user.name || 'User'} width={44} height={44} className="rounded-full object-cover border-2 border-[#C19A6B]" />
                ) : (
                  <div className="w-11 h-11 bg-muted border border-[#C19A6B] text-[#C19A6B] rounded-full flex items-center justify-center font-serif font-bold text-lg uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-xs uppercase tracking-wider text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
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
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                        isActive 
                          ? "bg-[#C19A6B] text-black" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
                
                <div className="pt-4 border-t border-border">
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 w-full bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
