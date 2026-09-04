import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThemeWrapper from './_components/ThemeWrapper'
import { deepLTranslateMany } from '@/lib/translate'

// Cette page ne fait que des appels Prisma directs (pas de fetch) : Next.js ne détecte pas
// automatiquement qu'elle est dynamique et peut la mettre en cache statique après la première
// visite, ce qui fige le contenu (texte hero, logements...) tant qu'aucun redéploiement n'a
// lieu. On force le rendu à chaque requête pour que les modifications de l'hôte soient
// immédiatement visibles.
export const dynamic = 'force-dynamic'

const VALID_LANGS = ['fr', 'en', 'es']

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { slug } = await params
  const { lang: langParam } = await searchParams
  const lang = langParam && VALID_LANGS.includes(langParam) ? langParam : 'fr'

  const owner = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      slug: true,
      siteTitle: true,
      tagline: true,
      heroSubtitle: true,
      logo: true,
      theme: true,
      primaryColor: true,
      phone: true,
      whatsapp: true,
      properties: {
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        include: {
          blockedDates: {
            where: { date: { gte: new Date() } },
            select: { date: true },
          },
          priceOverrides: {
            where: { date: { gte: new Date() } },
            select: { date: true, price: true },
          },
        },
      },
    },
  })

  if (!owner) notFound()

  let properties = owner.properties

  // Traduire les descriptions avec DeepL si langue != fr
  if (lang !== 'fr' && properties.length > 0) {
    const descriptions = properties.map(p => p.description || '')
    const translated = await deepLTranslateMany(descriptions, lang)
    properties = properties.map((p, i) => ({ ...p, description: translated[i] || p.description }))
  }

  const ownerData = {
    ...owner,
    lang,
    properties: properties.map(p => ({
      ...p,
      blockedDates: p.blockedDates.map(b => ({ date: b.date.toISOString() })),
      priceOverrides: p.priceOverrides?.map(o => ({ date: o.date.toISOString(), price: o.price })),
    })),
  }

  // Schema.org structured data (P2-6)
  const baseUrl = `https://staydirect.fr/p/${slug}`
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@graph': [
      // Site owner as LocalBusiness
      {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}#owner`,
        name: owner.siteTitle || owner.name,
        description: owner.tagline || undefined,
        url: baseUrl,
        ...(owner.phone ? { telephone: owner.phone } : {}),
        ...(owner.email ? { email: owner.email } : {}),
        ...(owner.logo ? { logo: owner.logo } : {}),
      },
      // Each property as LodgingBusiness
      ...properties.map(p => ({
        '@type': 'LodgingBusiness',
        '@id': `${baseUrl}#property-${p.id}`,
        name: p.name,
        description: p.description || undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: p.city,
          addressCountry: 'FR',
        },
        priceRange: `${p.pricePerNight}€/nuit`,
        maximumAttendeeCapacity: p.maxGuests,
        url: baseUrl,
        ...(p.images?.[0] ? { image: p.images[0] } : {}),
        offers: {
          '@type': 'Offer',
          price: p.pricePerNight,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      })),
    ],
  }

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <ThemeWrapper owner={ownerData as any} />
      <footer className="bg-gray-950 text-center py-6 text-gray-500 text-xs border-t border-gray-800">
        <p>
          Site propulsé par{' '}
          <a href="https://www.staydirect.fr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition font-medium">
            StayDirect
          </a>{' '}
          · Réservation directe sans commission
        </p>
      </footer>
    </div>
  )
}
