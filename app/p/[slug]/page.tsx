import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ThemeWrapper from './_components/ThemeWrapper'

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const owner = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      image: true,
      slug: true,
      siteTitle: true,
      tagline: true,
      logo: true,
      theme: true,
      primaryColor: true,
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

  const ownerData = {
    ...owner,
    properties: owner.properties.map(p => ({
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
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition font-medium">
            StayDirect
          </Link>{' '}
          · Réservation directe sans commission
        </p>
      </footer>
    </div>
  )
}
