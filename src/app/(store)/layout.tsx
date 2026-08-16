import dynamic from 'next/dynamic'
import { Navbar, MobileBottomNav } from '@/components/store/Navbar'
import { Footer } from '@/components/store/Footer'

const DynamicCartDrawer = dynamic(
  () => import('@/components/store/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
)

const DynamicCompareDrawer = dynamic(
  () => import('@/components/store/CompareDrawer').then((m) => m.CompareDrawer),
  { ssr: false }
)

const DynamicGlobalQuickViewModal = dynamic(
  () => import('@/components/store/QuickViewModal').then((m) => m.GlobalQuickViewModal),
  { ssr: false }
)

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

      <DynamicCartDrawer />
      <DynamicCompareDrawer />
      <DynamicGlobalQuickViewModal />
      <MobileBottomNav />
    </div>
  )
}
