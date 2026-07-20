import { Button } from '@/components/ui/Button'
import { Mail, MapPin, Phone } from 'lucide-react'

export const metadata = {
  title: 'Hubungi Kami - Raxie',
}

export default function ContactPage() {
  return (
    <div className="container-raxie py-20 max-w-4xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-center">Hubungi Kami</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold mb-2">Informasi Kontak</h3>
            <p className="text-muted-foreground mb-6">Kami senang mendengar dari Anda! Hubungi kami melalui salah satu saluran di bawah ini.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"><Phone className="w-5 h-5" /></div>
                <span>+62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"><Mail className="w-5 h-5" /></div>
                <span>hello@raxie.com</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                <span>Jl. Pahlawan No. 123, Bandung, Jawa Barat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Kirim Pesan</h3>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama Lengkap</label>
              <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="Masukkan nama Anda" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input type="email" className="w-full bg-background border border-border rounded-xl px-4 py-2" placeholder="Masukkan email Anda" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Pesan</label>
              <textarea className="w-full bg-background border border-border rounded-xl px-4 py-2 min-h-[120px]" placeholder="Bagaimana kami bisa membantu?" />
            </div>
            <Button type="button" variant="brand" className="w-full">Kirim Pesan</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
