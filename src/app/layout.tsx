import type { Metadata, Viewport } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'
import { STORE_CONFIG } from '@/lib/constants'
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://raxie.id'),
  title: {
    default: 'Raxie — Premium Leather Wallets & Accessories',
    template: '%s | Raxie',
  },
  description:
    'Temukan koleksi dompet PU Leather premium Raxie. Desain modern, tahan lama, dan harga terjangkau. Pengiriman ke seluruh Indonesia.',
  keywords: [
    'dompet pria',
    'dompet PU leather',
    'dompet kulit sintetis premium',
    'wallet kulit murah',
    'aksesoris pria Indonesia',
    'Raxie',
    'dompet bifold',
    'cardholder',
    'slim wallet',
    'dompet vegan leather',
  ],
  authors: [{ name: 'Raxie' }],
  creator: 'Raxie',
  publisher: 'Raxie',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://raxie.id',
    siteName: 'Raxie',
    title: 'Raxie — Dompet PU Leather Premium',
    description:
      'Koleksi dompet PU Leather premium Raxie. Desain modern, tahan lama, harga terjangkau.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raxie — Dompet PU Leather Premium',
    description: 'Koleksi dompet PU Leather premium Raxie.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0D0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

import { Suspense } from 'react'
import MetaPixel from '@/components/analytics/MetaPixel'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { DeferredWidgets } from '@/components/providers/DeferredWidgets'

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Raxie',
  alternateName: 'Raxie Official Store',
  url: 'https://raxie.id',
  logo: 'https://i.imgur.com/X1YcH8c.jpeg',
  description: 'Brand fashion Indonesia terkemuka untuk dompet PU Leather premium, tas, & aksesoris pria modern.',
  sameAs: [
    STORE_CONFIG.instagram,
    STORE_CONFIG.tiktok,
    STORE_CONFIG.shopee,
    'https://www.facebook.com/raxie.official'
  ],
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Raxie Official Store',
  url: 'https://raxie.id',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://raxie.id/products?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}

const jsonLdStore = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Raxie Official Store',
  description: 'Jual dompet PU Leather premium, tas, & aksesoris pria elegan berkualitas tinggi.',
  url: 'https://raxie.id',
  priceRange: 'Rp100.000 - Rp500.000',
  currenciesAccepted: 'IDR',
  paymentAccepted: 'Bank Transfer, QRIS, Credit Card, E-Wallet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStore) }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <DeferredWidgets />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
