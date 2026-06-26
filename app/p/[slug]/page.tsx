import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThemeWrapper from './_components/ThemeWrapper'
import { deepLTranslateMany } from '@/lib/translate'

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
      logo: true,
      theme: true,
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

  return (
    <div className="min-h-screen">
      <ThemeWrapper owner={ownerData as any} />
      <footer className="bg-gray-950 text-center py-6 text-gray-500 text-xs border-t border-gray-800">
        <p>
          Site propulsé par{' '}
          <Link href="/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition font-medium">
            StayDirect
          </Link>{' '}
          · Réservation directe sans commission
        </p>
      </footer>
    </div>
  )
}
