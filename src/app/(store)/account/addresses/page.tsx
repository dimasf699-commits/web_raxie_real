'use client'

import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toaster'

export default function AddressesPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Buku Alamat</h1>
          <p className="text-muted-foreground mt-1">Kelola alamat pengiriman Anda.</p>
        </div>
        <Button
          variant="brand"
          size="sm"
          onClick={() => toast.info('Fitur tambah alamat segera hadir!', '')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah Alamat
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-bold text-foreground mb-1">Belum Ada Alamat</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Tambahkan alamat pengiriman agar proses checkout lebih cepat.
        </p>
        <Button
          variant="outline"
          onClick={() => toast.info('Fitur tambah alamat segera hadir!', '')}
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah Alamat Pertama
        </Button>
      </div>
    </div>
  )
}
