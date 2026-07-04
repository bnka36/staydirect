import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'

  // Pages statiques publiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/alternative-airbnb`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/cgu`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Pages dynamiques propriétaires
  let ownerPages: MetadataRoute.Sitemap = []
  try {
    const users = await prisma.user.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
    })
    ownerPages = users
      .filter(u => u.slug)
      .map(u => ({
        url: `${base}/p/${u.slug}`,
        lastModified: u.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }))
  } catch {
    // DB indisponible au build — sitemap partiel
  }

  return [...staticPages, ...ownerPages]
}
