'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Custom Event tracking
export const gaEvent = (action: string, params = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', action, params)
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && GA_MEASUREMENT_ID) {
      pageview(pathname)
    }
  }, [pathname, searchParams])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
