'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, CircleCheck, CircleAlert, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Verify token exists on mount
  useEffect(() => {
    if (!token || !email) {
      setErrorMessage('Tautan reset kata sandi tidak valid atau tidak lengkap.')
      setStatus('error')
    }
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setErrorMessage('Kata sandi tidak cocok')
      setStatus('error')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Kata sandi minimal 8 karakter')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setTimeout(() => {
          router.push('/login?reset=success')
        }, 3000)
      } else {
        setErrorMessage(data.message || 'Gagal mereset kata sandi')
        setStatus('error')
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan koneksi')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="bg-white dark:bg-[#151515] py-8 px-4 shadow-2xl sm:rounded-sm sm:px-10 border border-neutral-200 dark:border-neutral-800 text-center">
        <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white mb-3">Tautan Tidak Valid</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-6 leading-relaxed">
          Tautan reset kata sandi ini tidak valid atau mungkin sudah kedaluwarsa.
        </p>
        <Link href="/forgot-password">
          <button className="w-full bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm transition-colors">
            MINTA TAUTAN BARU
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-[#151515] py-8 px-4 shadow-2xl sm:rounded-sm sm:px-10 border border-neutral-200 dark:border-neutral-800">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 mb-6">
              <CircleCheck className="h-8 w-8 text-green-600 dark:text-green-500" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider text-black dark:text-white mb-3">
              Kata Sandi Berhasil Diubah!
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-6 leading-relaxed">
              Anda akan diarahkan ke halaman login dalam 3 detik...
            </p>
            <Link href="/login">
              <button className="w-full bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm transition-colors">
                KE HALAMAN LOGIN
              </button>
            </Link>
          </motion.div>
        ) : (
          <form
            key="form"
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {status === 'error' && (
              <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-500 border border-red-200 dark:border-red-800/50 text-xs font-bold rounded-sm flex items-start gap-2">
                <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-10 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#121212] dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold text-[11px] uppercase tracking-wider py-4 rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>MEMPROSES...</span>
              ) : (
                'SIMPAN KATA SANDI BARU'
              )}
            </button>
          </form>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] flex flex-col pt-24 pb-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl md:text-4xl font-serif font-extrabold uppercase tracking-tight text-black dark:text-white mb-3">
          Buat Kata Sandi Baru
        </h2>
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed font-medium">
          Pastikan kata sandi baru Anda kuat dan mudah diingat.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
