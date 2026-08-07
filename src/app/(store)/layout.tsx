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
      <main className="min-h-screen pt-[80px] md:pt-[88px]">{children}</main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <CompareDrawer />
    </>
  )
}
