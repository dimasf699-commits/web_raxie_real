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
      <div className="bg-white dark:bg-charcoal-900 py-8 px-4 shadow-xl shadow-tan-500/5 sm:rounded-2xl sm:px-10 border border-border text-center">
        <CircleAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">Tautan Tidak Valid</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Tautan reset kata sandi ini tidak valid atau mungkin sudah kedaluwarsa.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Minta Tautan Baru
          </Button>
        </Link>
      </div>
    )
  }

  return (
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
              Kata Sandi Berhasil Diubah!
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              Anda akan diarahkan ke halaman login dalam 3 detik...
            </p>
            <Link href="/login">
              <Button className="w-full">Ke Halaman Login</Button>
            </Link>
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

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none"
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
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
                'Simpan Kata Sandi Baru'
              )}
            </Button>
          </form>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-ivory-100 dark:bg-charcoal-950 flex flex-col pt-24 pb-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-serif font-bold tracking-tight text-foreground">
          Buat Kata Sandi Baru
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm mx-auto">
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
