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
    <div className="min-h-screen bg-ivory-100 dark:bg-charcoal-950 flex flex-col pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 ml-4 sm:ml-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>
        <h2 className="text-center text-3xl font-serif font-bold tracking-tight text-foreground">
          Lupa Kata Sandi?
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm mx-auto">
          Jangan khawatir! Masukkan alamat email yang terdaftar dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white dark:bg-charcoal-900 py-8 px-4 shadow-xl shadow-tan-500/5 sm:rounded-2xl sm:px-10 border border-border">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <CircleCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-3">
                  Periksa Email Anda
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Kami telah mengirimkan tautan reset kata sandi ke <strong>{email}</strong>. 
                  Tautan tersebut berlaku selama 1 jam.
                </p>
                <p className="text-xs text-muted-foreground mb-6">
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
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                    <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Kirim Tautan Reset'
                  )}
                </Button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
