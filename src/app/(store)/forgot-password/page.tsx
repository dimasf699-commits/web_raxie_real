'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Mail, CircleCheck, CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setErrorMessage('Email harus diisi')
      setStatus('error')
      return
    }

    setIsLoading(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
      } else {
        setErrorMessage(data.message || 'Gagal mengirim email reset password')
        setStatus('error')
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan koneksi')
      setStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] flex flex-col pt-24 pb-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors mb-6 ml-4 sm:ml-0"
        >
          <ArrowLeft className="w-4 h-4" />
          KEMBALI KE LOGIN
        </Link>
        <h2 className="text-center text-3xl md:text-4xl font-serif font-extrabold uppercase tracking-tight text-black dark:text-white mb-3">
          Lupa Password?
        </h2>
        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed font-medium">
          Jangan khawatir! Masukkan alamat email yang terdaftar dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
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
                  Periksa Email Anda
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium mb-6 leading-relaxed">
                  Kami telah mengirimkan tautan reset kata sandi ke <strong>{email}</strong>. 
                  Tautan tersebut berlaku selama 1 jam.
                </p>
                <p className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400 mb-6">
                  Tidak menerima email? Periksa folder Spam atau coba lagi nanti.
                </p>
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

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm pl-11 pr-4 py-3 text-xs text-black dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
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
                    'KIRIM TAUTAN RESET'
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
