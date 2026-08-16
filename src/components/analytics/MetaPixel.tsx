'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

// Declare FBQ type for TypeScript
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Helpers for safe fbq calls
export const trackPageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }
}

export const trackViewContent = (params: { content_ids: string[]; content_name: string; value: number; currency: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_type: 'product',
      ...params
    })
  }
}

export const trackAddToCart = (params: { content_ids: string[]; content_name: string; value: number; currency: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_type: 'product',
      ...params
    })
  }
}

export const trackInitiateCheckout = (params: { content_ids: string[]; num_items: number; value: number; currency: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_type: 'product',
      ...params
    })
  }
}

export const trackPurchase = (orderId: string, params: { value: number; currency: string; content_ids: string[]; num_items: number }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // Browser-side deduplication safeguard
    const storageKey = `meta_pixel_purchased_${orderId}`
    if (localStorage.getItem(storageKey)) {
      console.log('Purchase event already tracked in browser for this order')
      return
    }
    
    window.fbq(
      'track', 
      'Purchase', 
      {
        content_type: 'product',
        ...params
      },
      {
        eventID: orderId // CRITICAL: Standard Meta CAPI deduplication parameter
      }
    )
    
    // Mark as tracked
    localStorage.setItem(storageKey, 'true')
  }
}

export default function MetaPixel() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const hasInitialized = useRef(false)
  const lastPathname = useRef('')

  useEffect(() => {
    // Prevent double PageView on initial load or exact same route
    const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
    
    if (hasInitialized.current && currentPath !== lastPathname.current) {
      trackPageView()
    }
    
    hasInitialized.current = true
    lastPathname.current = currentPath
  }, [pathname, searchParams])

  if (!FB_PIXEL_ID) return null

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt="fb pixel"
        />
      </noscript>
    </>
  )
}
