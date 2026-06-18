import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params

  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      siteTitle: true,
      tagline: true,
      name: true,
      logo: true,
      properties: {
        where: { isActive: true },
        select: { name: true, description: true, city: true, country: true, images: true, maxGuests: true, pricePerNight: true },
        take: 1,
      },
    },
  })

  if (!user) return { title: 'Location vacances' }

  const prop = user.properties[0]
  const siteTitle = user.siteTitle || user.name || 'Location vacances'
  const city = prop?.city || ''
  const country = prop?.country || ''
  const desc = prop?.description
    ? prop.description.substring(0, 160)
    : `Location vacances à ${city}${country ? ', ' + country : ''}. Réservation directe sans commission.`

  const title = `${siteTitle} – Location à ${city}`
  const image = prop?.images?.[0]

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: image ? [image] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: image ? [image] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
