import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
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
    default: 'StayDirect — Site de réservation directe pour propriétaires · 0% commission',
    template: '%s | StayDirect',
  },
  description: 'Créez votre site de réservation directe en 5 minutes. Arrêtez de payer 15-20% de commission à Airbnb et Booking. Livret d\'accueil QR, cautions bancaires, sync iCal. Dès 9€/mois.',
  keywords: ['réservation directe', 'site location vacances', 'alternative Airbnb', 'sans commission', 'propriétaire location courte durée', 'logiciel PMS', 'livret accueil numérique', 'caution bancaire location'],
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: APP_URL,
    siteName: 'StayDirect',
    title: 'StayDirect — Site de réservation directe · 0% commission · dès 9€/mois',
    description: 'Créez votre site de réservation directe en 5 minutes. Stop aux commissions Airbnb. Livret QR + cautions inclus.',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'StayDirect' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StayDirect — Réservations directes sans commission',
    description: 'Recevez des réservations directes pour votre logement sans payer de commissions à Airbnb ou Booking.',
    images: ['/og'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: APP_URL },
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
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TP0KDTPXGH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TP0KDTPXGH');
          `}
        </Script>
      </body>
    </html>
  )
}
