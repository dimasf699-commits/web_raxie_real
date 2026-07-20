'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(session?.user?.name || '')

  const user = session?.user
  const isGoogleAccount = !!(user?.image && user.image.includes('googleusercontent'))

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Profil &amp; Keamanan</h1>
        <p className="text-muted-foreground mt-1">Kelola data diri dan keamanan akun Anda.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-bold text-foreground">Biodata Diri</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-tan-600 font-medium text-sm hover:underline"
          >
            {isEditing ? 'Batal' : 'Ubah'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
            <label className="text-sm font-medium text-muted-foreground mb-1 md:mb-0">Nama Lengkap</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={isEditing ? name : (user?.name || '-')}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-transparent border-b border-transparent disabled:opacity-70 focus:outline-none focus:border-tan-400 px-0 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
            <label className="text-sm font-medium text-muted-foreground mb-1 md:mb-0">Email</label>
            <div className="md:col-span-2">
              <input
                type="email"
                value={user?.email || '-'}
                disabled
                className="w-full bg-transparent border-b border-transparent opacity-70 px-0 py-2"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 flex justify-end">
            <Button onClick={() => setIsEditing(false)}>Simpan Perubahan</Button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-bold text-foreground border-b border-border pb-4">Kontak &amp; Keamanan</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">
                {user?.email || '-'}
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full ml-2 font-bold uppercase">Terverifikasi</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Nomor HP</p>
              <p className="text-sm text-muted-foreground">Belum diatur</p>
            </div>
          </div>
        </div>

        {!isGoogleAccount && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Kata Sandi</p>
                <p className="text-sm text-muted-foreground">********</p>
              </div>
            </div>
          </div>
        )}

        {isGoogleAccount && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm">
            Akun Anda terhubung melalui Google. Keamanan dikelola oleh Google.
          </div>
        )}
      </div>
    </div>
  )
}
