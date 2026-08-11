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
      <h1 className="font-serif text-3xl md:text-5xl font-extrabold mb-4 text-center uppercase tracking-tight text-black dark:text-white">
        HUBUNGI KAMI
      </h1>
      <p className="text-neutral-500 dark:text-neutral-400 font-medium text-xs md:text-sm text-center max-w-lg mx-auto mb-12">
        Ada pertanyaan seputar produk, stok, atau pesanan Anda? Tim Layanan Pelanggan RAXIE siap memberikan bantuan terbaik untuk Anda.
      </p>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-12 items-start">
        {/* Contact Info */}
        <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm space-y-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">Informasi Kontak</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            Kami senang mendengar dari Anda! Hubungi kami melalui salah satu saluran di bawah ini.
          </p>

          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                <Phone className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">WHATSAPP / TELEPON</p>
                <a href="https://wa.me/6282128862433" target="_blank" rel="noopener noreferrer" className="font-bold text-black dark:text-white hover:text-[#C19A6B] transition-colors mt-0.5 inline-block">
                  0821-2886-2433
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                <Mail className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">EMAIL RESMI</p>
                <a href="mailto:raxieleather@gmail.com" className="font-bold text-black dark:text-white hover:text-[#C19A6B] transition-colors mt-0.5 inline-block">
                  raxieleather@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                <MapPin className="w-4 h-4 text-[#C19A6B]" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">ALAMAT WORKSHOP</p>
                <span className="font-medium text-black dark:text-white mt-0.5 block leading-relaxed">Kp. Pasirkiamis, Kec. Pasirwangi, Kab. Garut, Jawa Barat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-sm shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-4">Kirim Pesan</h3>

          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h4 className="font-bold text-sm text-black dark:text-white uppercase">Pesan Anda Berhasil Terkirim!</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Pesan telah diteruskan ke email <strong>raxieleather@gmail.com</strong> dan WhatsApp resmi RAXIE. Tim kami akan segera merespons Anda.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-6 bg-transparent border border-neutral-300 dark:border-neutral-700 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold text-[11px] uppercase tracking-wider px-6 py-3 rounded-sm transition-colors"
              >
                KIRIM PESAN LAINNYA
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-2 block">Nama Lengkap</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-2 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  placeholder="Masukkan email Anda"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400 mb-2 block">Pesan</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm px-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors min-h-[120px] resize-none"
                  placeholder="Bagaimana kami bisa membantu Anda?"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <span>MENGIRIM...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    KIRIM PESAN
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
