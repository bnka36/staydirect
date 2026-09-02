import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import EmbedWidget from './_components/EmbedWidget'
import { deepLTranslateMany } from '@/lib/translate'

const VALID_LANGS = ['fr', 'en', 'es']

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string; property?: string }>
}) {
  const { slug } = await params
  const { lang: langParam, property: propertyId } = await searchParams
  const lang = langParam && VALID_LANGS.includes(langParam) ? langParam : 'fr'

  const owner = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      siteTitle: true,
      primaryColor: true,
      phone: true,
      whatsapp: true,
      properties: {
        where: { isActive: true },
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

  let properties = propertyId ? owner.properties.filter(p => p.id === propertyId) : owner.properties

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

  return <EmbedWidget owner={ownerData as any} />
}
