import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — StayDirect',
  description: "Contactez l'équipe StayDirect. Nous répondons sous 24h pour vous aider à créer votre site de réservation directe.",
  alternates: {
    canonical: 'https://staydirect.fr/contact',
  },
  openGraph: {
    title: 'Contacter StayDirect',
    description: "Une question ? L'équipe StayDirect vous répond sous 24h.",
    url: 'https://staydirect.fr/contact',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary',
    title: 'Contacter StayDirect',
    description: "Une question ? L'équipe StayDirect vous répond sous 24h.",
  },
  robots: { index: true, follow: true },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
