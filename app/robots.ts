import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/p/', '/pricing', '/contact'],
        disallow: [
          '/dashboard',
          '/admin',
          '/onboarding',
          '/api/',
          '/livret/',
          '/caution/',
          '/reservation/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
