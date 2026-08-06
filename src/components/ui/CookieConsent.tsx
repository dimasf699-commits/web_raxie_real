'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import Link from 'next/link'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('raxie_cookie_consent')
    if (!accepted) {
      // Delay show by 2 seconds to not distract immediately
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('raxie_cookie_consent', 'accepted')
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem('raxie_cookie_consent', 'dismissed')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-3 md:p-4"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="max-w-4xl mx-auto bg-charcoal-900 dark:bg-charcoal-800 text-ivory-200 rounded-2xl shadow-2xl border border-charcoal-700 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3.5">
            <Cookie className="h-5 w-5 text-tan-400 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm flex-1 text-charcoal-300 leading-relaxed">
              Kami menggunakan cookie untuk meningkatkan pengalaman Anda dan menganalisis trafik situs.{' '}
              <Link href="/privacy-policy" className="text-tan-400 hover:underline">
                Pelajari selengkapnya
              </Link>
              .
            </p>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={dismiss}
                className="text-xs text-charcoal-400 hover:text-charcoal-200 transition-colors px-2 py-1"
                aria-label="Tolak cookie"
              >
                Tolak
              </button>
              <button
                onClick={accept}
                id="cookie-accept-btn"
                className="bg-tan-500 hover:bg-tan-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Terima
              </button>
              <button
                onClick={dismiss}
                className="text-charcoal-400 hover:text-charcoal-200 transition-colors ml-1"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
