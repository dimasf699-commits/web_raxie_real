'use client'

import { Store, Mail, Phone, MapPin, Globe } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-800 dark:text-foreground">Pengaturan Toko</h1>
        <p className="text-sm text-slate-500 mt-1">Konfigurasi informasi dan pengaturan dasar toko Anda</p>
      </div>

      <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold">Informasi Toko Raxie</h3>
            <p className="text-sm text-slate-500">Detail umum toko Raxie</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Toko</label>
            <input defaultValue="Raxie" className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Toko</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="hello@raxie.id" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Kontak Toko</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="082128862433" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat Toko</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea rows={2} className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                defaultValue="Jakarta, Indonesia" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input defaultValue="https://raxie.id" className="w-full pl-10 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
