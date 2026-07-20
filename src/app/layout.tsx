import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://raxie.id'),
  title: {
    default: 'Raxie — Premium Leather Wallets & Accessories',
    template: '%s | Raxie',
  },
  description:
    'Discover Raxie\'s collection of handcrafted premium leather wallets, cardholders, and accessories. Timeless craftsmanship, modern design.',
  keywords: [
    'dompet kulit premium',
    'wallet kulit asli',
    'aksesoris kulit',
    'leather wallet Indonesia',
    'Raxie',
    'handcrafted leather',
    'cardholder',
    'bifold wallet',
    'slim wallet',
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
    title: 'Raxie — Premium Leather Wallets & Accessories',
    description:
      'Handcrafted premium leather wallets and accessories. Timeless craftsmanship, modern design.',
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
      </head>
      <body>
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
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
