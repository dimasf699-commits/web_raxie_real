import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Journal & Blog | Raxie',
  description: 'Artikel dan cerita seputar gaya hidup, fashion, dan kerajinan kulit dari Raxie.',
}

export default function BlogPage() {
  return (
    <div className="pt-24 pb-20 min-h-[70vh] bg-[#FAF9F6] dark:bg-[#121212] transition-colors duration-300">
      <div className="container-raxie">
        <Breadcrumbs
          items={[
            { label: 'Beranda', href: '/' },
            { label: 'Journal', href: '/blog' },
          ]}
        />
        
        <div className="max-w-2xl mx-auto text-center mt-12 md:mt-24">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 text-[#C19A6B] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="font-serif font-extrabold text-3xl md:text-5xl uppercase tracking-tight text-black dark:text-white mb-4">
            Raxie Journal
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
            Halaman ini sedang dalam tahap pengembangan. Segera hadir cerita-cerita menarik seputar kerajinan kulit, tips merawat dompet, dan gaya hidup modern.
          </p>
        </div>
      </div>
    </div>
  )
}
