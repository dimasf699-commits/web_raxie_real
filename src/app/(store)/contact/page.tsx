'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Gagal', 'Mohon isi semua bidang terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setIsSubmitted(true)
        toast.success('Pesan Terkirim!', 'Pesan Anda telah dikirimkan ke raxieleather@gmail.com')
        
        // Auto-open WhatsApp with pre-filled message for instant CS response
        const waText = encodeURIComponent(`Halo Tim RAXIE, saya ${form.name} (${form.email}).\n\nPesan: ${form.message}`)
        window.open(`https://wa.me/6282128862433?text=${waText}`, '_blank')
        
        setForm({ name: '', email: '', message: '' })
      } else {
        const data = await res.json()
        toast.error('Gagal', data.error || 'Terjadi kesalahan.')
      }
    } catch {
      toast.error('Gagal', 'Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-raxie py-16 md:py-24 max-w-4xl">
      <h1 className="font-serif text-3xl md:text-5xl font-bold mb-4 text-center uppercase tracking-wide">
        HUBUNGI KAMI
      </h1>
      <p className="text-muted-foreground text-xs md:text-sm text-center max-w-lg mx-auto mb-12">
        Ada pertanyaan seputar produk, stok, atau pesanan Anda? Tim Layanan Pelanggan RAXIE siap memberikan bantuan terbaik untuk Anda.
      </p>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-12 items-start">
        {/* Contact Info */}
        <div className="bg-card border border-border p-6 md:p-8 rounded-2xl space-y-6 shadow-sm">
          <h3 className="text-base font-bold uppercase tracking-wider text-foreground">Informasi Kontak</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Kami senang mendengar dari Anda! Hubungi kami melalui salah satu saluran di bawah ini.
          </p>

          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Phone className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">WHATSAPP / TELEPON</p>
                <a href="https://wa.me/6282128862433" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:text-[#C19A6B] transition-colors">
                  0821-2886-2433
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <Mail className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">EMAIL RESMI</p>
                <a href="mailto:raxieleather@gmail.com" className="font-semibold text-foreground hover:text-[#C19A6B] transition-colors">
                  raxieleather@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0 border border-border">
                <MapPin className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">ALAMAT WORKSHOP</p>
                <span className="text-foreground">Kp. Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-4">Kirim Pesan</h3>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#C19A6B] mx-auto" />
              <h4 className="font-bold text-sm text-foreground uppercase">Pesan Anda Berhasil Terkirim!</h4>
              <p className="text-xs text-muted-foreground">
                Pesan telah diteruskan ke email <strong>raxieleather@gmail.com</strong> dan WhatsApp resmi RAXIE. Tim kami akan segera merespons Anda.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitted(false)}
                className="mt-4 text-xs font-bold uppercase"
              >
                Kirim Pesan Lainnya
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C19A6B]"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C19A6B]"
                  placeholder="Masukkan email Anda"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Pesan</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#C19A6B] min-h-[120px]"
                  placeholder="Bagaimana kami bisa membantu Anda?"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C19A6B] hover:bg-[#b08b5c] text-black font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    KIRIM PESAN
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
