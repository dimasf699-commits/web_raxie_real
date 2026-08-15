import { Navbar, MobileBottomNav } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'
import { CartDrawer } from '@/components/store/CartDrawer'
import { CompareDrawer } from '@/components/store/CompareDrawer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background text-foreground min-h-screen transition-colors duration-300">
      <Navbar />
      <main className="min-h-screen m-0 p-0 bg-background text-foreground pb-bottom-nav">{children}</main>
      <Footer />

      <CartDrawer />
      <CompareDrawer />
      <MobileBottomNav />
    </div>
  )
}
