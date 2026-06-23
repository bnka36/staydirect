import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'

async function getOwner(slug: string) {
  return prisma.user.findUnique({
    where: { slug },
    select: {
      siteTitle: true,
      tagline: true,
      name: true,
      logo: true,
      customDomain: true,
      properties: {
        where: { isActive: true },
        select: {
          name: true,
          description: true,
          city: true,
          country: true,
          address: true,
          images: true,
          maxGuests: true,
          pricePerNight: true,
        },
      },
    },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const user = await getOwner(slug)

  if (!user) return { title: 'Location vacances', robots: { index: false } }

  const prop = user.properties[0]
  const siteTitle = user.siteTitle || user.name || 'Location vacances'
  const city = prop?.city || ''
  const country = prop?.country || ''

  const title = `${siteTitle} – Location à ${city}`
  const description = prop?.description
    ? prop.description.substring(0, 160)
    : `Location vacances à ${city}${country ? ', ' + country : ''}. Réservation directe sans commission. À partir de ${prop?.pricePerNight ?? ''}€/nuit.`

  const image = prop?.images?.[0]
  const canonicalUrl = user.customDomain
    ? `https://${user.customDomain}`
    : `${APP_URL}/p/${slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteTitle,
      type: 'website',
      locale: 'fr_FR',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: { index: true, follow: true },
  }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getOwner(slug)

  const canonicalUrl = user?.customDomain
    ? `https://${user.customDomain}`
    : `${APP_URL}/p/${slug}`

  const jsonLdItems = (user?.properties ?? []).map((prop) => {
    const locationName = `${prop.city}${prop.country && prop.country !== 'France' ? `, ${prop.country}` : ''}`
    return {
      '@type': ['LodgingBusiness', 'VacationRental'],
      name: prop.name,
      description: prop.description ?? undefined,
      url: canonicalUrl,
      image: prop.images ?? [],
      address: {
        '@type': 'PostalAddress',
        streetAddress: prop.address ?? undefined,
        addressLocality: prop.city,
        addressCountry: prop.country === 'France' ? 'FR' : prop.country,
      },
      containedInPlace: {
        '@type': 'Place',
        name: locationName,
      },
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Parking', value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Air conditioning', value: true },
      ],
      occupancy: {
        '@type': 'QuantitativeValue',
        maxValue: prop.maxGuests,
        unitText: 'guests',
      },
      offers: {
        '@type': 'Offer',
        price: prop.pricePerNight,
        priceCurrency: 'EUR',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: prop.pricePerNight,
          priceCurrency: 'EUR',
          unitText: 'night',
        },
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        seller: {
          '@type': 'Person',
          name: user?.siteTitle || user?.name || 'Propriétaire',
        },
      },
    }
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': jsonLdItems.length === 1 ? [jsonLdItems[0]] : jsonLdItems,
  }

  return (
    <>
      {user && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
