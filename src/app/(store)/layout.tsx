import { Navbar, MobileBottomNav } from '@/components/store/Navbar'
import { AnnouncementBar } from '@/components/store/AnnouncementBar'
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
      <AnnouncementBar />
      <Navbar />
      <main className="min-h-screen pt-4">{children}</main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <CompareDrawer />
    </>
  )
}
