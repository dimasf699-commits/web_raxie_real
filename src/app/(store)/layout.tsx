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
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <CompareDrawer />
    </>
  )
}
