import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  alternates: { canonical: 'https://staydirect.fr/cgu' },
}

export default function CguPage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">StayDirect</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Retour</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d&apos;Utilisation</h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juin 2025</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Présentation du service</h2>
            <p>StayDirect est une plateforme SaaS éditée par PRESTA7 — Adeline Bouancheau (voir <Link href="/mentions-legales" className="text-blue-600 underline">mentions légales</Link>) permettant aux propriétaires de locations courtes durées de créer leur propre site de réservation directe, gérer un livret d&apos;accueil numérique et encaisser des cautions bancaires en ligne.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Accès au service</h2>
            <p>L&apos;accès au service est soumis à la création d&apos;un compte et au paiement d&apos;un abonnement mensuel. Un essai gratuit de 14 jours est proposé sans engagement ni carte bancaire requise.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Abonnements et tarifs</h2>
            <p>Les tarifs sont affichés sur la page <Link href="/pricing" className="text-blue-600 underline">Tarifs</Link>. L&apos;abonnement est sans engagement et peut être annulé à tout moment depuis le dashboard. Aucune commission n&apos;est prélevée sur les réservations reçues via StayDirect.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Responsabilités</h2>
            <p>Le propriétaire est responsable du contenu publié sur son site (descriptions, photos, tarifs). StayDirect n&apos;est pas partie aux contrats de location conclus entre propriétaires et voyageurs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Données personnelles</h2>
            <p>Les données collectées sont utilisées exclusivement pour le fonctionnement du service. Elles ne sont pas revendues à des tiers. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en nous contactant via <Link href="/contact" className="text-blue-600 underline">la page contact</Link>. Voir notre <Link href="/confidentialite" className="text-blue-600 underline">politique de confidentialité</Link> pour le détail complet.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact</h2>
            <p>Pour toute question concernant ces CGU, contactez-nous via <Link href="/contact" className="text-blue-600 underline">staydirect.fr/contact</Link>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
