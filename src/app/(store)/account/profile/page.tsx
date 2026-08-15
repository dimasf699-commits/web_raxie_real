'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const user = session?.user
  const isGoogleAccount = !!(user?.image && user.image.includes('googleusercontent'))

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/account/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setName(data.user.name || '')
            setPhone(data.user.phone || '')
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      setName(session.user.name || '')
      loadProfile()
    }
  }, [session])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Nama lengkap tidak boleh kosong')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyimpan perubahan')
      }

      toast.success('Profil Berhasil Diperbarui', 'Data profil Anda telah disimpan.')
      setIsEditing(false)
      if (updateSession) {
        await updateSession({ ...session, user: { ...session?.user, name: data.user.name } })
      }
    } catch (err: any) {
      toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan profil.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black dark:text-white">Profil &amp; Keamanan</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-xs font-medium">Kelola data diri dan keamanan akun Anda.</p>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">Biodata Diri</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] font-bold uppercase tracking-wider text-[#C19A6B] hover:text-black dark:hover:text-white transition-colors"
          >
            {isEditing ? 'Batal' : 'Ubah'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-[#C19A6B]" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 md:mb-0">Nama Lengkap</label>
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nama Lengkap"
                  className="w-full bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm disabled:opacity-75 disabled:bg-transparent disabled:border-transparent focus:outline-none focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 md:mb-0">Nomor HP / WA</label>
              <div className="md:col-span-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Contoh: 08123456789"
                  className="w-full bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm disabled:opacity-75 disabled:bg-transparent disabled:border-transparent focus:outline-none focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 md:mb-0">Email</label>
              <div className="md:col-span-2">
                <input
                  type="email"
                  value={user?.email || '-'}
                  disabled
                  className="w-full bg-transparent border-transparent opacity-50 px-3 py-2 text-xs text-black dark:text-white cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="border border-neutral-300 dark:border-neutral-700 text-black dark:text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider px-6 py-2.5 rounded-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 shadow-sm space-y-6">
        <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-4">Kontak &amp; Keamanan</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Email</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                {user?.email || '-'}
                <span className="bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50 text-[10px] px-2 py-0.5 rounded-sm ml-2 font-bold uppercase tracking-wider">Terverifikasi</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-neutral-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Nomor HP</p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
                {phone || 'Belum diatur'}
              </p>
            </div>
          </div>
        </div>

        {!isGoogleAccount && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Kata Sandi</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">********</p>
              </div>
            </div>
          </div>
        )}

        {isGoogleAccount && (
          <div className="p-4 rounded-sm bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium">
            Akun Anda terhubung melalui Google. Keamanan kata sandi dikelola secara otomatis oleh Google.
          </div>
        )}
      </div>
    </div>
  )
}
