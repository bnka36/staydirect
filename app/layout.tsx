import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'StayDirect — Réservations directes sans commission',
    template: '%s | StayDirect',
  },
  description: 'Recevez des réservations directes pour votre logement sans payer de commissions à Airbnb ou Booking. Créez votre site de réservation en 5 minutes.',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: APP_URL,
    siteName: 'StayDirect',
    title: 'StayDirect — Réservations directes sans commission',
    description: 'Recevez des réservations directes pour votre logement sans payer de commissions à Airbnb ou Booking.',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'StayDirect' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayDirect — Réservations directes sans commission',
    description: 'Recevez des réservations directes pour votre logement sans payer de commissions à Airbnb ou Booking.',
    images: ['/og'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StayDirect',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StayDirect" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VYCQZQNLPV" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VYCQZQNLPV');
        `}} />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
