'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const DynamicLiveChatWidget = dynamic(
  () => import('@/components/store/LiveChatWidget').then((mod) => mod.LiveChatWidget),
  { ssr: false }
)

const DynamicCookieConsent = dynamic(
  () => import('@/components/ui/CookieConsent').then((mod) => mod.CookieConsent),
  { ssr: false }
)

export function DeferredWidgets() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Defer non-critical floating widgets until main thread is idle
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => setShouldRender(true),
        { timeout: 3500 }
      )
      return () => (window as any).cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(() => setShouldRender(true), 2500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!shouldRender) return null

  return (
    <>
      <DynamicLiveChatWidget />
      <DynamicCookieConsent />
    </>
  )
}
