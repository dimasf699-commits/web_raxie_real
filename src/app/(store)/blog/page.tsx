import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Journal & Blog | Raxie',
  description: 'Artikel dan cerita seputar gaya hidup, fashion, dan kerajinan kulit dari Raxie.',
}

export default function BlogPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh]">
      <div className="container-raxie">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Journal', href: '/blog' },
          ]}
        />
        
        <div className="max-w-2xl mx-auto text-center mt-12 md:mt-24">
          <div className="w-20 h-20 bg-tan-100 text-tan-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4">
            Raxie Journal
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Halaman ini sedang dalam tahap pengembangan. Segera hadir cerita-cerita menarik seputar kerajinan kulit, tips merawat dompet, dan gaya hidup modern.
          </p>
        </div>
      </div>
    </div>
  )
}
