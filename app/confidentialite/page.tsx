import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  alternates: { canonical: 'https://staydirect.fr/confidentialite' },
}

export default function ConfidentialitePage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données collectées sur ce site est PRESTA7 — Adeline Bouancheau, éditeur de StayDirect.fr. Voir les{" "}
              <Link href="/mentions-legales" className="text-blue-600 underline">
                mentions légales
              </Link>{" "}
              pour l&apos;identité complète.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Données collectées</h2>
            <p>Dans le cadre de l&apos;utilisation de StayDirect, nous collectons : les informations de votre compte (nom, email), les informations de vos logements (descriptions, photos, tarifs), les données de réservation (voyageurs, dates, paiements traités via Stripe), et des données d&apos;usage nécessaires au fonctionnement du service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Finalité</h2>
            <p>Ces données sont utilisées exclusivement pour fournir le service (gestion des réservations, livret d&apos;accueil, encaissement des cautions) et pour vous contacter au sujet de votre abonnement. Elles ne sont jamais vendues à des tiers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Destinataires des données</h2>
            <p>Les paiements et cautions sont traités par Stripe, qui agit en tant que sous-traitant conformément au RGPD. Les données peuvent être hébergées via des prestataires techniques (hébergement, envoi d&apos;email) situés dans l&apos;Union Européenne ou aux États-Unis, dans le respect des garanties RGPD applicables.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Durée de conservation</h2>
            <p>Les données sont conservées pendant toute la durée de votre abonnement, puis supprimées dans un délai de 30 jours après résiliation, à l&apos;exception des documents de facturation, conservés 10 ans conformément aux obligations comptables du Code de commerce.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Vos droits (RGPD)</h2>
            <p>Conformément au Règlement Général sur la Protection des Données, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous via <Link href="/contact" className="text-blue-600 underline">la page contact</Link>. Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL (cnil.fr).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies</h2>
            <p>Le site utilise uniquement des cookies techniques nécessaires au fonctionnement (par exemple, mémoriser votre session). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé à ce jour.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
