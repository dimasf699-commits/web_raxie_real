import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Lokasi Toko | Raxie',
  description: 'Temukan toko fisik dan mitra resmi Raxie di kota Anda.',
}

export default function StoreLocatorPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie max-w-4xl">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Toko Kami', href: '/store-locator' },
          ]}
        />
        
        <div className="mt-8 prose prose-lg prose-stone dark:prose-invert">
          <h1 className="font-serif font-bold text-4xl mb-8">Lokasi Toko Kami</h1>
          <p>
            Saat ini, seluruh produk Raxie didistribusikan secara online melalui website resmi ini. Kami sedang mempersiapkan toko fisik (Flagship Store) agar Anda dapat melihat dan merasakan langsung kualitas produk kulit kami.
          </p>
          <p>
            <em>(Halaman ini adalah contoh tampilan sementara. Jika Anda memiliki toko offline (fisik), Anda dapat memasukkan alamat, jam operasional, dan peta lokasi di sini.)</em>
          </p>
        </div>
      </div>
    </div>
  )
}
