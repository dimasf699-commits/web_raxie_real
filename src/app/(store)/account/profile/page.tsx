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
        <h1 className="font-serif text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black dark:text-white">Profil &amp; Keamanan</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-xs font-medium">Kelola data diri dan keamanan akun Anda.</p>
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-black dark:text-white">Biodata Diri</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[11px] font-bold uppercase tracking-wider text-[#C19A6B] hover:text-black dark:hover:text-white transition-colors"
          >
            {isEditing ? 'Batal' : 'Ubah'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 items-center">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 md:mb-0">Nama Lengkap</label>
            <div className="md:col-span-2">
              <input
                type="text"
                value={isEditing ? name : (user?.name || '-')}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className="w-full bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm disabled:opacity-50 disabled:bg-transparent disabled:border-transparent focus:outline-none focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white transition-colors"
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
                className="w-full bg-transparent border-transparent opacity-50 px-3 py-2 text-xs text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 flex justify-end">
            <button onClick={() => setIsEditing(false)} className="bg-[#121212] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 font-bold text-[11px] uppercase tracking-wider px-6 py-3 rounded-sm transition-colors">SIMPAN PERUBAHAN</button>
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
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">Belum diatur</p>
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
            Akun Anda terhubung melalui Google. Keamanan dikelola oleh Google.
          </div>
        )}
      </div>
    </div>
  )
}
