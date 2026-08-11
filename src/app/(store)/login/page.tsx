'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { toast } from '@/components/ui/Toaster'

type Mode = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setLoading(false); return }

        toast.success('Pendaftaran Berhasil!', 'Akun Anda telah dibuat. Selamat datang di Raxie!')
        await signIn('credentials', { email: form.email, password: form.password, redirect: false })
        router.push('/account')
      } else {
        const result = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        })

        if (result?.error) {
          setError('Email atau password salah.')
          setLoading(false)
          return
        }
        router.push('/account')
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] dark:bg-[#121212] text-black dark:text-white px-4 py-16 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image
              src="https://i.imgur.com/SrBEKD5.png"
              alt="RAXIE Emblem"
              width={40}
              height={40}
              className="h-10 w-auto object-contain shrink-0"
              priority
            />
            <span className="font-serif font-extrabold text-3xl tracking-[0.2em] text-[#C19A6B] uppercase">
              RAXIE
            </span>
          </Link>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-widest">
            {mode === 'login' ? 'Masuk ke Akun Member Anda' : 'Buat Akun Member Baru'}
          </p>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 rounded-sm p-8 shadow-2xl space-y-6"
        >
          {/* Tab Toggle */}
          <div className="flex bg-neutral-50 dark:bg-neutral-900 p-1.5 rounded-sm border border-neutral-200 dark:border-neutral-800 gap-1.5">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                  mode === m ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm border border-neutral-200 dark:border-neutral-700' : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {m === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">NAMA LENGKAP</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama Lengkap Anda"
                      value={form.name}
                      onChange={handleChange}
                      required={mode === 'register'}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="email@domain.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">PASSWORD</label>
                {mode === 'login' && (
                  <Link href="/forgot-password" className="text-[#C19A6B] text-[10px] hover:underline font-bold uppercase tracking-wider">
                    Lupa password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={mode === 'register' ? 8 : 1}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-10 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 p-3 rounded-sm">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span>MEMPROSES...</span>
              ) : (
                <>
                  {mode === 'login' ? 'MASUK KE AKUN' : 'BUAT AKUN MEMBER'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
              <span className="bg-white dark:bg-[#151515] px-3">atau lanjutkan dengan</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/account' })}
            className="w-full flex items-center justify-center gap-3 py-3 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-bold text-black dark:text-white uppercase tracking-wider"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </motion.div>
      </div>
    </div>
  )
}
