import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales',
  alternates: { canonical: 'https://staydirect.fr/mentions-legales' },
}

export default function MentionsLegalesPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentions légales</h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : juillet 2026</p>

        <div className="space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Éditeur du site</h2>
            <p>
              Le site StayDirect (staydirect.fr) est édité par :<br />
              PRESTA7 — Adeline Bouancheau, micro-entrepreneur<br />
              Adresse du siège social : 37 rue de la Révolution, 34200 Sète<br />
              SIREN : 983 144 395<br />
              SIRET (siège social) : 983 144 395 00016<br />
              Code APE : 9609Z — Autres services personnels n.c.a.<br />
              TVA non applicable, article 293 B du Code général des impôts<br />
              Contact : via <Link href="/contact" className="text-blue-600 underline">la page contact</Link>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Directeur de la publication</h2>
            <p>Adeline Bouancheau</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Hébergement</h2>
            <p>
              Le site est hébergé par Vercel Inc.<br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Propriété intellectuelle</h2>
            <p>L&apos;ensemble des contenus présents sur ce site (textes, logo, éléments graphiques) est la propriété de l&apos;éditeur, sauf mention contraire, et ne peut être reproduit sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. Tout litige relatif à l&apos;utilisation de ce site relève de la compétence des tribunaux français.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
