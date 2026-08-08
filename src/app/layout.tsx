import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/Toaster'
import { CookieConsent } from '@/components/ui/CookieConsent'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://raxie.my.id'),
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
    url: 'https://raxie.my.id',
    siteName: 'Raxie',
    title: 'Raxie — Dompet PU Leather Premium',
    description:
      'Koleksi dompet PU Leather premium Raxie. Desain modern, tahan lama, harga terjangkau.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Raxie Premium Leather',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raxie — Premium Leather Wallets & Accessories',
    description:
      'Handcrafted premium leather wallets and accessories.',
    images: ['/og-image.jpg'],
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
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
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

import { LiveChatWidget } from '@/components/store/LiveChatWidget'

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Raxie',
  alternateName: 'Raxie Official Store',
  url: 'https://raxie.my.id',
  logo: 'https://i.imgur.com/X1YcH8c.jpeg',
  description: 'Brand fashion Indonesia terkemuka untuk dompet PU Leather premium, tas, & aksesoris pria modern.',
  sameAs: [
    'https://www.instagram.com/raxie.official',
    'https://raxie.my.id'
  ],
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Raxie Official Store',
  url: 'https://raxie.my.id',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://raxie.my.id/products?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const jsonLdStore = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'Raxie Store',
  image: 'https://i.imgur.com/X1YcH8c.jpeg',
  '@id': 'https://raxie.my.id/#store',
  url: 'https://raxie.my.id',
  telephone: '082128862433',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jakarta',
    addressLocality: 'Jakarta',
    addressRegion: 'DKI Jakarta',
    postalCode: '10000',
    addressCountry: 'ID',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
              <LiveChatWidget />
              <CookieConsent />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
