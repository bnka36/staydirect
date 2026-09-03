import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function getNights(checkIn: Date, checkOut: Date): number {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export interface LengthDiscountTier { minNights: number; percent: number }

// Remise dégressive à la nuitée : on applique le meilleur palier atteint (ex: -10% à partir
// de 4 nuits, -20% à partir de 27 nuits). Champ stocké en JSON côté Property.lengthDiscounts.
export function bestLengthDiscountPercent(lengthDiscounts: string | null | undefined, nights: number): number {
  if (!lengthDiscounts) return 0
  try {
    const tiers = JSON.parse(lengthDiscounts) as LengthDiscountTier[]
    const applicable = tiers.filter(t => nights >= t.minNights && t.percent > 0)
    if (applicable.length === 0) return 0
    return Math.min(100, Math.max(...applicable.map(t => t.percent)))
  } catch {
    return 0
  }
}

// Nettoie/valide les paliers de remise envoyés par le formulaire hôte avant stockage en JSON.
export function sanitizeLengthDiscounts(input: unknown): string | null {
  if (!Array.isArray(input)) return null
  const tiers = (input as { minNights?: unknown; percent?: unknown }[])
    .map(t => ({ minNights: parseInt(String(t?.minNights)), percent: parseInt(String(t?.percent)) }))
    .filter(t => Number.isFinite(t.minNights) && t.minNights > 0 && Number.isFinite(t.percent) && t.percent > 0 && t.percent <= 100)
    .sort((a, b) => a.minNights - b.minNights)
  return tiers.length > 0 ? JSON.stringify(tiers) : null
}
