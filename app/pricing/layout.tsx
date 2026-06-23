import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs — StayDirect',
  description: "Découvrez nos offres StayDirect. Créez votre site de réservation directe en 5 minutes à partir de 19€/mois. Sans commission, sans intermédiaire.",
  alternates: {
    canonical: 'https://staydirect.fr/pricing',
  },
  openGraph: {
    title: 'Tarifs StayDirect — Réservations directes sans commission',
    description: "Créez votre site de réservation directe en 5 minutes. À partir de 19€/mois. Économisez jusqu'à 3 000€/an vs Airbnb.",
    url: 'https://staydirect.fr/pricing',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs StayDirect',
    description: "Créez votre site de réservation directe à partir de 19€/mois.",
  },
  robots: { index: true, follow: true },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
