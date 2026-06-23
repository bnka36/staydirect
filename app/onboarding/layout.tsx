import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bienvenue sur StayDirect',
  robots: { index: false, follow: false },
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
