'use client'
import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

export interface Property {
  id: string
  name: string
  description: string
  city: string
  country: string
  address: string
  pricePerNight: number
  maxGuests: number
  baseGuests?: number
  pricePerExtraGuest?: number
  amenities?: string[]
  images: string[]
  blockedDates: { date: string }[]
  priceOverrides?: { date: string; price: number }[]
}

export interface Owner {
  name: string
  slug: string
  email?: string
  image: string
  siteTitle?: string
  tagline?: string
  logo?: string
  theme?: string
  primaryColor?: string
  lang?: string
  phone?: string
  whatsapp?: string
  properties: Property[]
}

// ─── i18n ────────────────────────────────────────────────────────────────────
const UI = {
  fr: {
    book: 'Réserver →',
    bookNow: 'Réserver maintenant',
    bookProperty: 'Réserver ce logement →',
    contact: '💬 Contacter l\'hôte',
    contactTitle: '💬 Envoyer un message à l\'hôte',
    send: 'Envoyer le message →',
    sending: 'Envoi…',
    sent: 'Message envoyé !',
    sentSub: 'L\'hôte vous répondra par email.',
    namePlaceholder: 'Votre nom',
    emailPlaceholder: 'Votre email',
    phonePlaceholder: 'Téléphone (optionnel)',
    msgPlaceholder: 'Votre message (dates souhaitées, questions…)',
    guests: 'voyageurs max',
    photos: 'photos',
    perNight: '/ nuit',
    bestPrice: 'Meilleur prix garanti · sans frais',
    amenities: 'Équipements',
    description: 'Description',
    secure: '🔒 Paiement sécurisé',
    noFees: '✓ Sans frais cachés',
    direct: '💬 Contact direct',
    properties: 'Nos logements',
    discover: 'Découvrir →',
    bookFrom: 'Dès',
    night: 'nuit',
    securePayment: 'Paiement sécurisé',
    securePaymentSub: 'Stripe SSL',
    directBook: 'Réservation directe',
    directBookSub: 'Sans intermédiaire',
    bestPriceBadge: 'Meilleur prix',
    bestPriceSub: 'Garanti',
    support: 'Support local',
    supportSub: 'Réponse rapide',
    whyDirect: 'Pourquoi réserver en direct ?',
    commission: '0% de commission',
    commissionSub: 'Vous payez le juste prix, sans frais de service.',
    bestPriceWhy: 'Meilleur prix garanti',
    bestPriceWhySub: 'Réservez ici pour le tarif le plus bas.',
    secureWhy: 'Paiement 100% sécurisé',
    secureWhySub: 'Stripe — crypté et protégé.',
    flexWhy: 'Contact direct',
    flexWhySub: 'Échangez directement avec l\'hôte.',
  },
  en: {
    book: 'Book →',
    bookNow: 'Book now',
    bookProperty: 'Book this property →',
    contact: '💬 Contact host',
    contactTitle: '💬 Send a message to the host',
    send: 'Send message →',
    sending: 'Sending…',
    sent: 'Message sent!',
    sentSub: 'The host will reply by email.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'Your email',
    phonePlaceholder: 'Phone (optional)',
    msgPlaceholder: 'Your message (desired dates, questions…)',
    guests: 'guests max',
    photos: 'photos',
    perNight: '/ night',
    bestPrice: 'Best price guaranteed · no fees',
    amenities: 'Amenities',
    description: 'Description',
    secure: '🔒 Secure payment',
    noFees: '✓ No hidden fees',
    direct: '💬 Direct contact',
    properties: 'Our properties',
    discover: 'Discover →',
    bookFrom: 'From',
    night: 'night',
    securePayment: 'Secure payment',
    securePaymentSub: 'Stripe SSL',
    directBook: 'Direct booking',
    directBookSub: 'No middleman',
    bestPriceBadge: 'Best price',
    bestPriceSub: 'Guaranteed',
    support: 'Local support',
    supportSub: 'Fast response',
    whyDirect: 'Why book direct?',
    commission: '0% commission',
    commissionSub: 'You pay the right price, no service fees.',
    bestPriceWhy: 'Best price guaranteed',
    bestPriceWhySub: 'Book here for the lowest rate.',
    secureWhy: '100% secure payment',
    secureWhySub: 'Stripe — encrypted and protected.',
    flexWhy: 'Direct contact',
    flexWhySub: 'Chat directly with your host.',
  },
  es: {
    book: 'Reservar →',
    bookNow: 'Reservar ahora',
    bookProperty: 'Reservar este alojamiento →',
    contact: '💬 Contactar al anfitrión',
    contactTitle: '💬 Enviar un mensaje al anfitrión',
    send: 'Enviar mensaje →',
    sending: 'Enviando…',
    sent: '¡Mensaje enviado!',
    sentSub: 'El anfitrión le responderá por email.',
    namePlaceholder: 'Su nombre',
    emailPlaceholder: 'Su email',
    phonePlaceholder: 'Teléfono (opcional)',
    msgPlaceholder: 'Su mensaje (fechas deseadas, preguntas…)',
    guests: 'huéspedes máx.',
    photos: 'fotos',
    perNight: '/ noche',
    bestPrice: 'Mejor precio garantizado · sin comisiones',
    amenities: 'Servicios',
    description: 'Descripción',
    secure: '🔒 Pago seguro',
    noFees: '✓ Sin cargos ocultos',
    direct: '💬 Contacto directo',
    properties: 'Nuestros alojamientos',
    discover: 'Descubrir →',
    bookFrom: 'Desde',
    night: 'noche',
    securePayment: 'Pago seguro',
    securePaymentSub: 'Stripe SSL',
    directBook: 'Reserva directa',
    directBookSub: 'Sin intermediarios',
    bestPriceBadge: 'Mejor precio',
    bestPriceSub: 'Garantizado',
    support: 'Soporte local',
    supportSub: 'Respuesta rápida',
    whyDirect: '¿Por qué reservar directo?',
    commission: '0% de comisión',
    commissionSub: 'Pagas el precio justo, sin cargos de servicio.',
    bestPriceWhy: 'Mejor precio garantizado',
    bestPriceWhySub: 'Reserva aquí para la tarifa más baja.',
    secureWhy: 'Pago 100% seguro',
    secureWhySub: 'Stripe — cifrado y protegido.',
    flexWhy: 'Contacto directo',
    flexWhySub: 'Habla directamente con el anfitrión.',
  },
}

type Lang = keyof typeof UI

// ─── Traduction équipements ────────────────────────────────────────────────────
const AMENITY_TRANSLATIONS: Record<string, { en: string; es: string }> = {
  'Proche mer':              { en: 'Near the sea',          es: 'Cerca del mar' },
  'Proche ville & attractions': { en: 'City center & attractions', es: 'Centro y atracciones' },
  'Piscine privée':          { en: 'Private pool',          es: 'Piscina privada' },
  'Piscine':                 { en: 'Pool',                  es: 'Piscina' },
  'Parking privé':           { en: 'Private parking',       es: 'Aparcamiento privado' },
  'Wi-Fi gratuit':           { en: 'Free Wi-Fi',            es: 'Wi-Fi gratis' },
  'Climatisation':           { en: 'Air conditioning',      es: 'Aire acondicionado' },
  'Jardin':                  { en: 'Garden',                es: 'Jardín' },
  'Cuisine équipée':         { en: 'Fully equipped kitchen', es: 'Cocina equipada' },
  'Baignoire':               { en: 'Bathtub',               es: 'Bañera' },
  'Vue montagne':            { en: 'Mountain view',         es: 'Vista a la montaña' },
  'Vue mer':                 { en: 'Sea view',              es: 'Vista al mar' },
  'Barbecue':                { en: 'Barbecue',              es: 'Barbacoa' },
  'Salle de jeux':           { en: 'Game room',             es: 'Sala de juegos' },
  'Animaux acceptés':        { en: 'Pets allowed',          es: 'Se admiten mascotas' },
}

const ALL_AMENITIES: Record<string, string> = {
  'Proche mer': '🏖',
  'Proche ville & attractions': '🌆',
  'Piscine privée': '🏊',
  'Piscine': '🏊',
  'Parking privé': '🚗',
  'Wi-Fi gratuit': '📶',
  'Climatisation': '❄️',
  'Jardin': '🌿',
  'Cuisine équipée': '🍳',
  'Baignoire': '🛁',
  'Vue montagne': '🏔',
  'Vue mer': '🌊',
  'Barbecue': '🔥',
  'Salle de jeux': '🎮',
  'Animaux acceptés': '🐾',
}

const DEFAULT_AMENITIES = [
  { icon: '🏖', label: 'Proche mer' },
  { icon: '🏊', label: 'Piscine' },
  { icon: '🚗', label: 'Parking privé' },
  { icon: '📶', label: 'Wi-Fi gratuit' },
  { icon: '❄️', label: 'Climatisation' },
]

function getAmenities(property: { amenities?: string[] }, lang: Lang) {
  const items = property.amenities && property.amenities.length > 0
    ? property.amenities.map(label => ({ icon: ALL_AMENITIES[label] || '✓', label }))
    : DEFAULT_AMENITIES
  if (lang === 'fr') return items
  return items.map(a => ({
    icon: a.icon,
    label: AMENITY_TRANSLATIONS[a.label]?.[lang] || a.label,
  }))
}

const LANG_FLAGS: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸' }

function LangSwitcher({ slug, current }: { slug: string; current: string }) {
  return (
    <div className="flex gap-1 bg-black/30 backdrop-blur-sm rounded-full p-1">
      {(['fr', 'en', 'es'] as const).map(l => (
        <a
          key={l}
          href={`/p/${slug}?lang=${l}`}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
            current === l ? 'bg-white text-gray-900' : 'text-white/80 hover:text-white hover:bg-white/20'
          }`}
        >
          <span>{LANG_FLAGS[l]}</span>
          <span className="uppercase">{l}</span>
        </a>
      ))}
    </div>
  )
}

export default function ThemeWrapper({ owner }: { owner: Owner }) {
  const [detailProperty, setDetailProperty] = useState<Property | null>(null)
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null)

  const theme = owner.theme || 'modern'
  const color = owner.primaryColor || '#2563eb'
  const title = owner.siteTitle || owner.name
  const tagline = owner.tagline || 'Réservation directe · Sans commission'
  const lang = owner.lang || 'fr'

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: theme === 'luxury' ? 'Georgia, serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        :root { --primary: ${color}; }
        .btn-primary { background-color: ${color}; }
        .btn-primary:hover { filter: brightness(0.9); }
        .text-primary { color: ${color}; }
        .border-primary { border-color: ${color}; }
        .bg-primary-light { background-color: ${color}15; }
      `}</style>

      {/* Sélecteur de langue flottant */}
      <div className="fixed bottom-4 right-4 z-50">
        <LangSwitcher slug={owner.slug} current={lang} />
      </div>

      {theme === 'modern' && <ModernTheme owner={owner} title={title} tagline={tagline} color={color} lang={lang as Lang} onBook={setDetailProperty} />}
      {theme === 'luxury' && <LuxuryTheme owner={owner} title={title} tagline={tagline} color={color} lang={lang as Lang} onBook={setDetailProperty} />}
      {theme === 'nature' && <NatureTheme owner={owner} title={title} tagline={tagline} color={color} lang={lang as Lang} onBook={setDetailProperty} />}
      {theme === 'minimal' && <MinimalTheme owner={owner} title={title} tagline={tagline} color={color} lang={lang as Lang} onBook={setDetailProperty} />}

      {detailProperty && !bookingProperty && (
        <PropertyDetailModal
          property={detailProperty}
          owner={owner}
          color={color}
          lang={lang as Lang}
          onClose={() => setDetailProperty(null)}
          onBook={() => { setBookingProperty(detailProperty); setDetailProperty(null) }}
        />
      )}
      {bookingProperty && (
        <BookingModal property={bookingProperty} color={color} lang={lang as Lang} onClose={() => setBookingProperty(null)} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 1 — MODERN
// ══════════════════════════════════════════
function ModernTheme({ owner, title, tagline, color, lang, onBook }: { owner: Owner; title: string; tagline: string; color: string; lang: Lang; onBook: (p: Property) => void }) {
  const t = UI[lang] || UI.fr
  const moleProp = owner.properties.find((p) => p.name?.toLowerCase().includes('môle') || p.name?.toLowerCase().includes('mole'))
  const heroImg = (moleProp || owner.properties[0])?.images?.[0]

  return (
    <div className="bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <style>{`
        .luxury-shadow { box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04); }
        .luxury-shadow-lg { box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06); }
        .luxury-shadow-hover:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08); transform: translateY(-6px); }
        .btn-luxury { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .btn-luxury:hover { transform: translateY(-2px); filter: brightness(1.06); box-shadow: 0 12px 32px rgba(0,0,0,0.18) !important; }
        .img-zoom { transition: transform 0.7s cubic-bezier(0.4,0,0.2,1); }
        .img-zoom:hover { transform: scale(1.04); }
        .amenity-pill { backdrop-filter: blur(12px); }
        @media (max-width: 640px) {
          .luxury-shadow-hover:hover { transform: none; }
          .btn-luxury:hover { transform: none; }
        }
      `}</style>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-xl border-b border-gray-100/80" style={{ boxShadow: '0 1px 16px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-[60px] md:h-[68px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            {owner.logo ? (
              <img src={owner.logo} alt={title} className="h-8 md:h-9 w-auto object-contain max-w-[140px]" />
            ) : (
              <span className="text-[15px] md:text-[17px] font-bold text-gray-900 tracking-tight truncate">{title}</span>
            )}
          </div>
          <nav className="hidden md:flex items-center gap-7">
            <a href="#logements" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">Logements</a>
            <a href="#amenities" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">Équipements</a>
            <a href="#garanties" className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200">Garanties</a>
          </nav>
          <div className="flex items-center gap-2 flex-shrink-0">
            {owner.whatsapp && (
              <a href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.112 1.522 5.84L.057 23.25a.75.75 0 00.943.943l5.41-1.465A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.56-5.33-1.528l-.383-.234-3.965 1.073 1.073-3.965-.234-.383A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
            )}
            {owner.phone && (
              <a href={`tel:${owner.phone}`}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-[12px] font-medium transition">
                📞 {owner.phone}
              </a>
            )}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-emerald-100/80">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
              {t.securePayment}
            </div>
            <button onClick={() => onBook(owner.properties[0])} className="btn-luxury text-white text-[12px] md:text-[13px] font-semibold px-4 md:px-5 py-2 md:py-2.5 rounded-[10px] whitespace-nowrap" style={{ backgroundColor: color, boxShadow: `0 4px 14px ${color}40` }}>
              {t.book}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-[60px] md:pt-[68px]">
        <div className="relative overflow-hidden" style={{ height: 'min(92vh, 760px)', minHeight: '480px' }}>
          {heroImg ? (
            <div className="absolute inset-0 overflow-hidden">
              <Image src={heroImg} alt={title} fill className="object-cover img-zoom" priority sizes="100vw" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.50) 65%, rgba(0,0,0,0.88) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.30) 0%, transparent 65%)' }} />
          <div className="absolute top-4 right-4 hidden sm:flex flex-col gap-2 items-end">
            <div className="amenity-pill flex items-center gap-1.5 bg-white/10 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-white/20" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>✓ {t.directBook}</div>
            <div className="amenity-pill flex items-center gap-1.5 bg-white/10 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-white/20" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>✓ {t.commission}</div>
            <div className="amenity-pill flex items-center gap-1.5 bg-emerald-500/80 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>✓ {t.bestPriceBadge}</div>
          </div>
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="max-w-7xl mx-auto w-full px-5 md:px-8 pb-12 md:pb-16">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-white/55 text-[11px] font-bold tracking-[0.20em] uppercase">RÉSERVATION DIRECTE</span>
                </div>
                <h1 className="text-[28px] sm:text-[36px] md:text-[52px] lg:text-[64px] font-black text-white leading-[1.05] tracking-tight mb-3 md:mb-4">
                  {title || 'Vos vacances,'}<br />{(owner as any).heroSubtitle || 'au meilleur prix.'}
                </h1>
                <p className="text-white/70 text-[14px] md:text-[17px] font-normal leading-relaxed mb-5 md:mb-8 max-w-xl line-clamp-2 md:line-clamp-none">
                  {tagline || 'Réservation directe sans commission. Parking privé, piscine inclus.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-5 md:mb-7">
                  <button onClick={() => onBook(owner.properties[0])} className="btn-luxury inline-flex items-center justify-center gap-2 text-white text-[14px] font-bold px-6 py-3.5 md:px-8 md:py-4 rounded-[14px]" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 28px ${color}55` }}>
                    {t.bookNow}
                  </button>
                  <a href="#logements" className="btn-luxury inline-flex items-center justify-center gap-2 bg-white/10 amenity-pill text-white text-[14px] font-semibold px-6 py-3.5 md:px-8 md:py-4 rounded-[14px] border border-white/25">
                    {t.properties} ↓
                  </a>
                </div>
                <div className="hidden sm:flex flex-wrap gap-2">
                  {[
                    { icon: '⭐', text: '4.8/5 satisfaction' },
                    { icon: '💰', text: lang === 'en' ? 'Up to 20% cheaper' : lang === 'es' ? 'Hasta 20% más barato' : "Jusqu'à 20% moins cher" },
                    { icon: '🔒', text: t.securePayment },
                  ].map(b => (
                    <div key={b.text} className="amenity-pill flex items-center gap-1.5 bg-black/35 text-white/85 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/12">
                      <span>{b.icon}</span> {b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AMENITIES STRIP */}
        <div id="amenities" className="bg-white border-b border-gray-100" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div className="max-w-7xl mx-auto px-5 md:px-8">
            <div className="flex items-center justify-between overflow-x-auto gap-0 py-0 scrollbar-hide divide-x divide-gray-100">
              {getAmenities(owner.properties[0] || {}, lang).map(a => (
                <div key={a.label} className="flex items-center gap-2.5 flex-shrink-0 px-5 md:px-8 py-4">
                  <span className="text-[20px]">{a.icon}</span>
                  <span className="text-[13px] font-semibold text-gray-700 whitespace-nowrap">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROPERTIES */}
      <section id="logements" className="py-12 md:py-28 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 md:mb-14">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color }}>COLLECTION</p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <h2 className="text-[24px] md:text-[42px] font-black text-gray-900 leading-tight">
                {owner.properties.length > 1 ? t.properties : (lang === 'en' ? 'Your stay' : lang === 'es' ? 'Tu estancia' : 'Votre séjour')}
              </h2>
            </div>
          </div>
          <div className="space-y-8">
            {owner.properties[0] && <LuxuryPropertyCard property={owner.properties[0]} color={color} lang={lang} onBook={() => onBook(owner.properties[0])} />}
          </div>
          {owner.properties.length > 1 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {owner.properties.slice(1).map((p) => (
                <ModernCard key={p.id} property={p} color={color} lang={lang} onBook={() => onBook(p)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section id="garanties" className="py-20 px-5 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[0.18em] uppercase mb-3 text-gray-400">AVANTAGES</p>
            <h2 className="text-[32px] md:text-[40px] font-black text-gray-900">Pourquoi réserver en direct ?</h2>
            <p className="text-gray-400 text-[15px] mt-3 max-w-lg mx-auto">Sans commission, sans intermédiaire. Le prix le plus bas, la relation la plus directe.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '🔒', label: t.securePayment, sub: t.securePaymentSub },
              { icon: '✦', label: t.directBook, sub: t.directBookSub },
              { icon: '💰', label: t.bestPriceBadge, sub: t.bestPriceSub },
              { icon: '💬', label: t.support, sub: t.supportSub },
            ].map(b => (
              <div key={b.label} className="bg-white rounded-[20px] p-7 luxury-shadow transition-all duration-300 luxury-shadow-hover">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] mb-5 bg-gray-50">{b.icon}</div>
                <div className="text-[15px] font-bold text-gray-900 mb-1">{b.label}</div>
                <div className="text-[13px] text-gray-400">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-5 md:px-8 overflow-hidden" style={{ backgroundColor: color }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-white/60 text-[11px] font-bold tracking-[0.18em] uppercase mb-4">RÉSERVATION DIRECTE</p>
          <h2 className="text-[28px] md:text-[52px] font-black text-white leading-tight mb-4 md:mb-5">Le meilleur prix,<br />garanti.</h2>
          <p className="text-white/70 text-[14px] md:text-[16px] mb-8 md:mb-10 max-w-md mx-auto leading-relaxed">Économisez jusqu&apos;à 20% vs Airbnb ou Booking. Aucune commission, aucun frais cachés. Paiement 100% sécurisé.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onBook(owner.properties[0])} className="btn-luxury bg-white text-[15px] font-bold px-10 py-4 rounded-[14px] w-full sm:w-auto" style={{ color, boxShadow: '0 8px 32px rgba(0,0,0,0.20)' }}>
              {t.bookNow} →
            </button>
            <a href="#logements" className="text-white/80 text-[14px] font-medium hover:text-white transition-colors">{t.properties}</a>
          </div>
        </div>
      </section>
    </div>
  )
}

function LuxuryPropertyCard({ property, color, lang = 'fr', onBook }: { property: Property; color: string; lang?: Lang; onBook: () => void }) {
  const t = UI[lang] || UI.fr
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  const location = `${property.city}${property.country && property.country !== 'France' ? `, ${property.country}` : ''}`
  const airbnbPrice = Math.round(property.pricePerNight * 1.18)
  const savings = Math.round(property.pricePerNight * 0.18)

  return (
    <div className="rounded-[24px] overflow-hidden luxury-shadow-lg bg-white transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] min-h-[520px]">
        <div className="relative overflow-hidden bg-gray-100 min-h-[320px] lg:min-h-0">
          {imgs[idx] ? (
            <Image src={imgs[idx]} alt={property.name} fill className="object-cover img-zoom" sizes="(max-width: 1024px) 100vw, 55vw" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">🏠</div>
          )}
          {imgs.length > 1 && (
            <>
              <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 text-lg font-light transition hover:bg-white hover:scale-110" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>‹</button>
              <button onClick={() => setIdx(i => (i + 1) % imgs.length)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-800 text-lg font-light transition hover:bg-white hover:scale-110" style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>›</button>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.slice(0, 7).map((_: string, i: number) => (
                  <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
              <div className="absolute bottom-5 right-5 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">{idx + 1} / {imgs.length}</div>
            </>
          )}
          <div className="absolute top-5 left-5">
            <div className="bg-white text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ color, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>✓ RÉSERVATION DIRECTE</div>
          </div>
        </div>
        <div className="flex flex-col justify-between p-8 lg:p-10">
          <div>
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-gray-400 mb-2">📍 {location}</p>
            <h3 className="text-[26px] md:text-[30px] font-black text-gray-900 leading-tight mb-4">{property.name}</h3>
            {property.description && <p className="text-[14px] text-gray-500 leading-relaxed mb-6 line-clamp-3">{property.description}</p>}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-50 text-gray-600 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-gray-100">👥 {property.maxGuests} {t.guests}</span>
              <span className="bg-gray-50 text-gray-600 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-gray-100">📸 {imgs.length} {t.photos}</span>
              <span className="bg-emerald-50 text-emerald-700 text-[12px] font-semibold px-3.5 py-1.5 rounded-full border border-emerald-100">{t.commission}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-8">
              {getAmenities(property, lang).slice(0, 4).map(a => (
                <span key={a.label} className="text-gray-500 text-[12px] flex items-center gap-1"><span>{a.icon}</span> {a.label}</span>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-[16px] p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-gray-400 font-medium">Prix Airbnb / Booking</span>
                <span className="text-[14px] text-gray-300 line-through font-medium">{formatPrice(airbnbPrice)}/nuit</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-emerald-600 font-bold">{lang === 'en' ? `Direct price (save ${formatPrice(savings)})` : lang === 'es' ? `Precio directo (ahorra ${formatPrice(savings)})` : `Prix direct (vous économisez ${formatPrice(savings)})`}</span>
                <span className="text-[22px] font-black text-gray-900">{formatPrice(property.pricePerNight)}<span className="text-[13px] font-medium text-gray-400">{t.perNight}</span></span>
              </div>
            </div>
            <button onClick={onBook} className="btn-luxury w-full text-white text-[15px] font-bold py-4 rounded-[14px]" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 8px 28px ${color}55` }}>
              {t.bookProperty}
            </button>
            <div className="flex items-center justify-center gap-4 pt-1">
              <span className="text-[11px] text-gray-400 flex items-center gap-1">{t.secure}</span>
              <span className="text-gray-200">·</span>
              <span className="text-[11px] text-gray-400">{t.noFees}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModernCard({ property, color, lang = 'fr', onBook }: { property: Property; color: string; lang?: Lang; onBook: () => void }) {
  const t = UI[lang] || UI.fr
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  const location = `${property.city}${property.country && property.country !== 'France' ? `, ${property.country}` : ''}`
  return (
    <div className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 luxury-shadow-hover group cursor-pointer" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)' }} onClick={onBook}>
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover img-zoom" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>}
        {imgs.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length) }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 text-lg font-medium shadow transition hover:bg-white hover:scale-110">‹</button>
            <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length) }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 text-lg font-medium shadow transition hover:bg-white hover:scale-110">›</button>
            <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">{idx + 1}/{imgs.length}</div>
          </>
        )}
      </div>
      <div className="p-6">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1.5">{location}</p>
        <h3 className="text-[17px] font-black text-gray-900 mb-2">{property.name}</h3>
        {property.description && <p className="text-gray-400 text-[13px] mb-5 line-clamp-2 leading-relaxed">{property.description}</p>}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div><span className="text-[20px] font-black text-gray-900">{formatPrice(property.pricePerNight)}</span><span className="text-gray-400 text-[12px] ml-1">{t.perNight}</span></div>
          <button onClick={e => { e.stopPropagation(); onBook() }} className="btn-luxury text-white text-[12px] font-bold px-5 py-2.5 rounded-[10px]" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 14px ${color}50` }}>{t.book}</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 2 — LUXURY
// ══════════════════════════════════════════
function LuxuryTheme({ owner, title, tagline, color, lang, onBook }: { owner: Owner; title: string; tagline: string; color: string; lang: Lang; onBook: (p: Property) => void }) {
  const t = UI[lang] || UI.fr
  return (
    <div className="bg-stone-950 text-white min-h-screen">
      <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {owner.logo ? <img src={owner.logo} alt={title} className="h-8 w-auto" /> : <div className="text-xl font-bold tracking-widest uppercase" style={{ color }}>{title}</div>}
          </div>
          <div className="flex items-center gap-3">
            {owner.whatsapp && (
              <a href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.112 1.522 5.84L.057 23.25a.75.75 0 00.943.943l5.41-1.465A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.56-5.33-1.528l-.383-.234-3.965 1.073 1.073-3.965-.234-.383A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
            )}
            {owner.phone && (
              <a href={`tel:${owner.phone}`} className="flex items-center gap-1.5 text-stone-300 hover:text-white text-[12px] font-medium transition">
                📞 {owner.phone}
              </a>
            )}
            <div className="text-xs text-stone-400 tracking-widest uppercase">{t.directBook}</div>
          </div>
        </div>
      </header>
      {owner.properties[0]?.images?.[0] && (
        <div className="relative h-[60vh] overflow-hidden">
          <Image src={owner.properties[0].images[0]} alt={title} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-stone-300 text-sm tracking-widest uppercase mb-4">{tagline}</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
            <a href="#logements" className="border border-white text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition">{t.discover}</a>
          </div>
        </div>
      )}
      <div id="logements" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-stone-500 text-xs tracking-widest uppercase mb-2">Nos propriétés</p>
          <h2 className="text-2xl font-bold">{owner.properties.length > 1 ? `${owner.properties.length} logements d&apos;exception` : 'Votre logement'}</h2>
        </div>
        <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}>
          {owner.properties.map(p => <LuxuryCard key={p.id} property={p} color={color} lang={lang} onBook={() => onBook(p)} />)}
        </div>
      </div>
    </div>
  )
}

function LuxuryCard({ property, color, lang = 'fr', onBook }: { property: Property; color: string; lang?: Lang; onBook: () => void }) {
  const t = UI[lang] || UI.fr
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  return (
    <div className="group cursor-pointer" onClick={onBook}>
      <div className="relative h-72 overflow-hidden mb-4">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover group-hover:scale-105 transition duration-700" /> : <div className="w-full h-full bg-stone-800 flex items-center justify-center text-4xl">🏠</div>}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {imgs.map((_: string, i: number) => <button key={i} onClick={e => { e.stopPropagation(); setIdx(i) }} className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? 'bg-white' : 'bg-white/40'}`} />)}
          </div>
        )}
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-lg mb-1">{property.name}</h3>
          <p className="text-stone-400 text-sm">📍 {property.city} · 👥 {property.maxGuests} pers.</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold" style={{ color }}>{formatPrice(property.pricePerNight)}</div>
          <div className="text-stone-500 text-xs">{t.perNight}</div>
        </div>
      </div>
      <button className="mt-4 w-full border py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition" style={{ borderColor: color, color }} onClick={e => { e.stopPropagation(); onBook() }}>{t.book}</button>
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 3 — NATURE
// ══════════════════════════════════════════
function NatureTheme({ owner, title, tagline, color, lang, onBook }: { owner: Owner; title: string; tagline: string; color: string; lang: Lang; onBook: (p: Property) => void }) {
  const t = UI[lang] || UI.fr
  const natureColor = color === '#2563eb' ? '#16a34a' : color
  return (
    <div className="bg-stone-50">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {owner.logo ? <img src={owner.logo} alt={title} className="h-9 w-auto" /> : <div className="font-bold text-xl" style={{ color: natureColor }}>{title}</div>}
          </div>
          <div className="flex items-center gap-3">
            {owner.whatsapp && (
              <a href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.112 1.522 5.84L.057 23.25a.75.75 0 00.943.943l5.41-1.465A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.56-5.33-1.528l-.383-.234-3.965 1.073 1.073-3.965-.234-.383A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                WhatsApp
              </a>
            )}
            {owner.phone && (
              <a href={`tel:${owner.phone}`} className="flex items-center gap-1.5 text-[12px] font-medium transition" style={{ color: natureColor }}>
                📞 {owner.phone}
              </a>
            )}
            <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${natureColor}15`, color: natureColor }}>🌿 {t.directBook}</div>
          </div>
        </div>
      </header>
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${natureColor}20, ${natureColor}05)` }}>
        <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: natureColor }}>🌿 {tagline}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-800 mb-4 leading-tight">{title}</h1>
            <p className="text-stone-500 mb-6">{t.bestPriceWhy}</p>
            <a href="#logements" className="inline-block text-white px-6 py-3 rounded-2xl font-semibold transition" style={{ backgroundColor: natureColor }}>{t.properties} →</a>
          </div>
          {owner.properties[0]?.images?.[0] && (
            <div className="flex-1 relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl">
              <Image src={owner.properties[0].images[0]} alt={title} fill className="object-cover" />
            </div>
          )}
        </div>
      </div>
      <div id="logements" className="max-w-5xl mx-auto px-6 py-12">
        <div className={owner.properties.length === 1 ? 'max-w-2xl mx-auto' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {owner.properties.map(p => <ModernCard key={p.id} property={p} color={natureColor} lang={lang} onBook={() => onBook(p)} />)}
        </div>
      </div>
      <WhyDirect color={natureColor} lang={lang} />
    </div>
  )
}

// ══════════════════════════════════════════
// THÈME 4 — MINIMAL
// ══════════════════════════════════════════
function MinimalTheme({ owner, title, tagline, color, lang, onBook }: { owner: Owner; title: string; tagline: string; color: string; lang: Lang; onBook: (p: Property) => void }) {
  const t = UI[lang] || UI.fr
  return (
    <div className="bg-white">
      <header className="px-8 py-6 flex items-center justify-between border-b border-gray-100 max-w-5xl mx-auto">
        <div>
          {owner.logo ? <img src={owner.logo} alt={title} className="h-8 w-auto" /> : <div className="text-xl font-bold tracking-tight text-gray-900">{title}</div>}
          <div className="text-xs text-gray-400 mt-0.5">{tagline}</div>
        </div>
        <div className="flex items-center gap-4">
          {owner.whatsapp && (
            <a href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full transition">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.112 1.522 5.84L.057 23.25a.75.75 0 00.943.943l5.41-1.465A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.56-5.33-1.528l-.383-.234-3.965 1.073 1.073-3.965-.234-.383A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </a>
          )}
          {owner.phone && (
            <a href={`tel:${owner.phone}`} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[12px] font-medium transition">
              📞 {owner.phone}
            </a>
          )}
          <a href="#logements" className="text-sm font-semibold underline underline-offset-4" style={{ color }}>{t.properties}</a>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-none mb-4">{title}</h1>
          <p className="text-xl text-gray-400">{tagline}</p>
        </div>
        <div id="logements" className={owner.properties.length === 1 ? 'max-w-2xl' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}>
          {owner.properties.map(p => <MinimalCard key={p.id} property={p} color={color} lang={lang} onBook={() => onBook(p)} />)}
        </div>
      </div>
    </div>
  )
}

function MinimalCard({ property, color, lang = 'fr', onBook }: { property: Property; color: string; lang?: Lang; onBook: () => void }) {
  const t = UI[lang] || UI.fr
  const [idx, setIdx] = useState(0)
  const imgs = property.images || []
  return (
    <div className="group border border-gray-100 hover:border-gray-200 transition rounded-xl overflow-hidden">
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        {imgs[idx] ? <Image src={imgs[idx]} alt={property.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🏠</div>}
        {imgs.length > 1 && <>
          <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 transition border border-gray-200 shadow">‹</button>
          <button onClick={() => setIdx(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 transition border border-gray-200 shadow">›</button>
        </>}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{property.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{property.city} · {property.maxGuests} {t.guests}</p>
        <div className="flex items-center justify-between">
          <div><span className="text-2xl font-bold text-gray-900">{formatPrice(property.pricePerNight)}</span><span className="text-gray-400 text-sm">{t.perNight}</span></div>
          <button onClick={onBook} className="text-sm font-semibold px-5 py-2.5 rounded-lg border-2 transition" style={{ borderColor: color, color }}
            onMouseOver={e => { (e.target as HTMLElement).style.backgroundColor = color; (e.target as HTMLElement).style.color = 'white' }}
            onMouseOut={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; (e.target as HTMLElement).style.color = color }}>
            {t.book}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// SECTION POURQUOI RÉSERVER EN DIRECT
// ══════════════════════════════════════════
function WhyDirect({ color = '#2563eb', lang = 'fr' }: { color?: string; lang?: Lang }) {
  const t = UI[lang] || UI.fr
  return (
    <section id="garanties" className="py-20 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-3">AVANTAGES</p>
          <h2 className="text-3xl md:text-4xl font-black text-white">{t.whyDirect}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '💰', title: t.bestPriceWhy, desc: t.bestPriceWhySub, badge: lang === 'en' ? 'Savings' : lang === 'es' ? 'Ahorros' : 'Économies' },
            { icon: '🔒', title: t.secureWhy, desc: t.secureWhySub, badge: lang === 'en' ? 'Security' : lang === 'es' ? 'Seguridad' : 'Sécurité' },
            { icon: '💬', title: t.flexWhy, desc: t.flexWhySub, badge: lang === 'en' ? 'Trust' : lang === 'es' ? 'Confianza' : 'Confiance' },
          ].map(item => (
            <div key={item.title} className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-600 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition">{item.icon}</div>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color }}>{item.badge}</div>
              <div className="font-black text-white text-lg mb-3">{item.title}</div>
              <div className="text-gray-400 text-sm leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════
// BOOKING CALENDAR
// ══════════════════════════════════════════
function BookingCalendar({ blockedDates, checkIn, checkOut, onSelect, color }: {
  blockedDates: string[]
  checkIn: string
  checkOut: string
  onSelect: (ci: string, co: string) => void
  color: string
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [hoverDate, setHoverDate] = useState('')

  const blocked = new Set(blockedDates.map(d => d.split('T')[0]))
  const toStr = (d: Date) => d.toISOString().split('T')[0]
  const isBlocked = (ds: string) => blocked.has(ds)
  const isPast = (ds: string) => ds < toStr(today)
  const isDisabled = (ds: string) => isBlocked(ds) || isPast(ds)
  const isInRange = (ds: string) => {
    if (!checkIn) return false
    const end = checkOut || hoverDate
    if (!end || end <= checkIn) return false
    return ds > checkIn && ds < end
  }
  const isStart = (ds: string) => ds === checkIn
  const isEnd = (ds: string) => ds === (checkOut || hoverDate)

  const handleClick = (ds: string) => {
    if (isDisabled(ds)) return
    if (!checkIn || (checkIn && checkOut)) { onSelect(ds, ''); return }
    if (ds <= checkIn) { onSelect(ds, ''); return }
    const ci = new Date(checkIn), co = new Date(ds)
    let cur = new Date(ci); cur.setDate(cur.getDate() + 1)
    let hasBlocked = false
    while (cur < co) { if (blocked.has(toStr(cur))) { hasBlocked = true; break } cur.setDate(cur.getDate() + 1) }
    if (hasBlocked) { onSelect(ds, ''); return }
    onSelect(checkIn, ds)
  }

  const getDays = (year: number, month: number) => {
    const first = new Date(year, month, 1)
    const last = new Date(year, month + 1, 0)
    const days: (string | null)[] = []
    const startDow = (first.getDay() + 6) % 7
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= last.getDate(); d++) days.push(toStr(new Date(year, month, d)))
    return days
  }

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) } else setViewMonth(m => m - 1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) } else setViewMonth(m => m + 1) }
  const canPrev = viewYear > today.getFullYear() || viewMonth > today.getMonth()
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const days = getDays(viewYear, viewMonth)
  const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} disabled={!canPrev} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 transition text-gray-600">‹</button>
        <span className="font-semibold text-gray-900 capitalize text-sm">{monthName}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition text-gray-600">›</button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((ds, i) => {
          if (!ds) return <div key={i} />
          const disabled = isDisabled(ds)
          const start = isStart(ds)
          const end = isEnd(ds) && !!checkOut
          const inRange = isInRange(ds)
          return (
            <button key={ds} type="button" disabled={disabled}
              onClick={() => handleClick(ds)}
              onMouseEnter={() => !disabled && setHoverDate(ds)}
              onMouseLeave={() => setHoverDate('')}
              className={`relative h-9 w-full text-xs font-medium rounded-lg transition-all ${disabled ? 'text-gray-200 cursor-not-allowed line-through' : 'cursor-pointer hover:opacity-80'} ${start || end ? 'text-white' : ''} ${inRange ? 'rounded-none' : ''} ${!disabled && !start && !end && !inRange ? 'text-gray-700 hover:bg-gray-100' : ''}`}
              style={{ backgroundColor: start || end ? color : inRange ? `${color}20` : undefined, color: start || end ? 'white' : inRange ? color : undefined }}>
              {parseInt(ds.split('-')[2])}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-200" /><span>Indisponible</span></div>
        {checkIn && <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded" style={{ backgroundColor: color }} /><span>Sélectionné</span></div>}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// BOOKING MODAL
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// FICHE LOGEMENT COMPLÈTE
// ══════════════════════════════════════════
function PropertyDetailModal({ property, owner, color, lang = 'fr', onClose, onBook }: {
  property: Property
  owner: Owner
  color: string
  lang?: Lang
  onClose: () => void
  onBook: () => void
}) {
  const [idx, setIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)
  const [contactError, setContactError] = useState('')
  const t = UI[lang] || UI.fr

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setContactSending(true)
    setContactError('')
    try {
      const res = await fetch('/api/contact-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, ...contactForm }),
      })
      if (!res.ok) throw new Error()
      setContactSent(true)
    } catch {
      setContactError(lang === 'en' ? 'An error occurred. Please try again.' : lang === 'es' ? 'Ha ocurrido un error. Inténtalo de nuevo.' : 'Une erreur est survenue. Réessayez.')
    } finally {
      setContactSending(false)
    }
  }
  const imgs = property.images || []
  const location = `${property.city}${property.country && property.country !== 'France' ? `, ${property.country}` : ''}`

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* GALERIE PHOTOS */}
        <div className="relative bg-gray-100 overflow-hidden" style={{ height: '260px' }}>
          {imgs[idx] ? (
            <Image
              src={imgs[idx]}
              alt={property.name}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => setFullscreen(true)}
              sizes="(max-width: 768px) 100vw, 672px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">🏠</div>
          )}

          {/* Navigation flèches */}
          {imgs.length > 1 && (
            <>
              <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-800 text-xl font-light shadow-lg transition hover:bg-white hover:scale-110">‹</button>
              <button onClick={() => setIdx(i => (i + 1) % imgs.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-800 text-xl font-light shadow-lg transition hover:bg-white hover:scale-110">›</button>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{idx + 1} / {imgs.length}</div>
            </>
          )}

          {/* Miniatures en bas */}
          {imgs.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.slice(0, 8).map((_: string, i: number) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`} />
              ))}
            </div>
          )}

          {/* Bouton fermer */}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center font-bold text-gray-600 shadow transition hover:bg-white">✕</button>

          {/* Badge photos */}
          {imgs.length > 1 && (
            <button onClick={() => setFullscreen(true)}
              className="absolute top-3 left-3 bg-black/55 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-black/70 transition">
              📸 {imgs.length} photos
            </button>
          )}
        </div>

        {/* CONTENU */}
        <div className="p-6">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">📍 {location}</p>
          <h2 className="text-2xl font-black text-gray-900 mb-3">{property.name}</h2>

          {/* Infos rapides */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">👥 {property.maxGuests} {t.guests}</span>
            {imgs.length > 0 && <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">📸 {imgs.length} {t.photos}</span>}
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-100">✓ 0% commission</span>
          </div>

          {/* Description complète */}
          {property.description && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-700 mb-2">{t.description}</h3>
              <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Équipements */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-2">{t.amenities}</h3>
            <div className="flex flex-wrap gap-2">
              {getAmenities(property, lang).map(a => (
                <span key={a.label} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full">
                  <span>{a.icon}</span> {a.label}
                </span>
              ))}
            </div>
          </div>

          {/* Prix + CTA */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-black text-gray-900">{formatPrice(property.pricePerNight)}</span>
              <span className="text-gray-400 text-sm ml-1">{t.perNight}</span>
              {property.baseGuests && property.pricePerExtraGuest ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  {lang === 'en' ? `Included up to ${property.baseGuests} guests · +${formatPrice(property.pricePerExtraGuest)}/extra guest` : lang === 'es' ? `Hasta ${property.baseGuests} huéspedes · +${formatPrice(property.pricePerExtraGuest)}/huésped extra` : `Jusqu'à ${property.baseGuests} voyageurs · +${formatPrice(property.pricePerExtraGuest)}/voyageur supplémentaire`}
                </p>
              ) : (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">{t.bestPrice}</p>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button onClick={onBook}
                className="text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg text-sm"
                style={{ backgroundColor: color, boxShadow: `0 6px 20px ${color}55` }}>
                {t.bookProperty}
              </button>
              <button onClick={() => setShowContact(c => !c)}
                className="border border-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">
                {t.contact}
              </button>
            </div>
          </div>

          {/* Formulaire contact hôte */}
          {showContact && (
            <div className="mt-4 border border-gray-100 rounded-2xl p-5 bg-gray-50">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">{t.contactTitle}</h3>
              {/* Boutons contact direct */}
              {(owner.whatsapp || owner.phone || owner.email) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {owner.whatsapp && (
                    <a
                      href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-600 transition">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.12.553 4.112 1.522 5.84L.057 23.25a.75.75 0 00.943.943l5.41-1.465A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.956 0-3.784-.56-5.33-1.528l-.383-.234-3.965 1.073 1.073-3.965-.234-.383A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      WhatsApp
                    </a>
                  )}
                  {owner.phone && (
                    <a
                      href={`tel:${owner.phone}`}
                      className="flex items-center gap-2 bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition">
                      📞 {owner.phone}
                    </a>
                  )}
                  {owner.email && (
                    <a
                      href={`mailto:${owner.email}`}
                      className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition bg-white">
                      ✉️ Email
                    </a>
                  )}
                </div>
              )}
              {contactSent ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="font-bold text-gray-900 text-sm">{t.sent}</div>
                  <div className="text-gray-500 text-xs mt-1">{t.sentSub}</div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      placeholder={t.namePlaceholder}
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
                      style={{ ['--tw-ring-color' as string]: color }}
                    />
                    <input
                      required
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={contactForm.phone}
                    onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder={t.msgPlaceholder}
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white resize-none"
                  />
                  {contactError && <p className="text-red-500 text-xs">{contactError}</p>}
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="w-full text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-60"
                    style={{ backgroundColor: color }}>
                    {contactSending ? t.sending : t.send}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Badges confiance */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
            <span>{t.secure}</span>
            <span className="text-gray-200">·</span>
            <span>{t.noFees}</span>
            <span className="text-gray-200">·</span>
            <span>{t.direct}</span>
          </div>
        </div>
      </div>

      {/* PLEIN ÉCRAN PHOTO */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center" onClick={() => setFullscreen(false)}>
          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {imgs[idx] && <Image src={imgs[idx]} alt={property.name} fill className="object-contain" sizes="100vw" />}
            {imgs.length > 1 && (
              <>
                <button onClick={() => setIdx(i => (i - 1 + imgs.length) % imgs.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition">‹</button>
                <button onClick={() => setIdx(i => (i + 1) % imgs.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition">›</button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">{idx + 1} / {imgs.length}</div>
              </>
            )}
            <button onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white font-bold transition">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingModal({ property, color, lang = 'fr', onClose }: { property: Property; color: string; lang?: Lang; onClose: () => void }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [numGuests, setNumGuests] = useState(1)
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'dates' | 'info'>('dates')

  const nights = checkIn && checkOut ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 0
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
  const blockedDates = property.blockedDates?.map(b => b.date) || []

  // Calcul supplément voyageurs
  const baseGuests = property.baseGuests || property.maxGuests
  const extraGuests = Math.max(0, numGuests - baseGuests)
  const extraFeePerNight = extraGuests * (property.pricePerExtraGuest || 0)
  const hasGuestPricing = !!(property.baseGuests && property.pricePerExtraGuest)

  const totalNightPrice = (nights: number) => (property.pricePerNight + extraFeePerNight) * nights

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.id, checkIn, checkOut, numGuests, ...form }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setLoading(false); return }
    if (data.skrillUrl) { window.location.href = data.skrillUrl; return }
    if (data.paypalUrl) { window.location.href = data.paypalUrl; return }
    if (data.pendingUrl) { window.location.href = data.pendingUrl; return }
    window.location.href = data.url
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[95vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Réserver · {property.name}</h2>
            <p className="text-sm text-gray-400">{formatPrice(property.pricePerNight)}/nuit · {property.maxGuests} voyageurs max</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 transition">✕</button>
        </div>
        <div className="p-6">
          {(checkIn || checkOut) && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl border" style={{ backgroundColor: `${color}08`, borderColor: `${color}25` }}>
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Arrivée</div>
                <div className="font-bold text-sm" style={{ color }}>{checkIn ? fmtDate(checkIn) : '—'}</div>
              </div>
              <div className="text-gray-300">→</div>
              <div className="flex-1 text-center">
                <div className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Départ</div>
                <div className="font-bold text-sm" style={{ color }}>{checkOut ? fmtDate(checkOut) : '—'}</div>
              </div>
              {nights > 0 && (
                <><div className="text-gray-300">·</div>
                <div className="text-center">
                  <div className="font-black text-base" style={{ color }}>{formatPrice(totalNightPrice(nights))}</div>
                  <div className="text-xs text-gray-400">{nights} nuit{nights > 1 ? 's' : ''}</div>
                </div></>
              )}
            </div>
          )}

          {/* Sélecteur nombre de voyageurs */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <div className="text-sm font-semibold text-gray-800">👥 Voyageurs</div>
              {hasGuestPricing && extraGuests > 0 && (
                <div className="text-xs text-orange-600 mt-0.5">+{formatPrice(extraFeePerNight)}/nuit pour {extraGuests} voyageur{extraGuests > 1 ? 's' : ''} supplémentaire{extraGuests > 1 ? 's' : ''}</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setNumGuests(g => Math.max(1, g - 1))}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold">−</button>
              <span className="text-base font-bold w-4 text-center">{numGuests}</span>
              <button type="button" onClick={() => setNumGuests(g => Math.min(property.maxGuests, g + 1))}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition font-bold">+</button>
            </div>
          </div>

          {step === 'dates' ? (
            <>
              <p className="text-xs text-gray-500 mb-3 font-medium">
                {!checkIn ? "👆 Cliquez sur la date d'arrivée" : !checkOut ? '👆 Cliquez maintenant sur la date de départ' : '✅ Dates sélectionnées — continuez'}
              </p>
              <BookingCalendar blockedDates={blockedDates} checkIn={checkIn} checkOut={checkOut} onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co) }} color={color} />
              <button type="button" disabled={nights <= 0} onClick={() => setStep('info')}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: color }}>
                {nights > 0 ? `Continuer — ${formatPrice(totalNightPrice(nights))} →` : 'Sélectionnez les dates'}
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep('dates')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">← Modifier les dates</button>
              {[
                { label: 'Nom complet', key: 'guestName', type: 'text', placeholder: 'Jean Dupont', required: true },
                { label: 'Email', key: 'guestEmail', type: 'email', placeholder: 'jean@exemple.fr', required: true },
                { label: 'Téléphone (optionnel)', key: 'guestPhone', type: 'tel', placeholder: '+33 6 00 00 00 00', required: false },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type} required={field.required} placeholder={field.placeholder}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 text-sm" />
                </div>
              ))}
              {hasGuestPricing && nights > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between"><span>{formatPrice(property.pricePerNight)} × {nights} nuit{nights > 1 ? 's' : ''}</span><span>{formatPrice(property.pricePerNight * nights)}</span></div>
                  {extraGuests > 0 && <div className="flex justify-between text-orange-600"><span>+{extraGuests} voyageur{extraGuests > 1 ? 's' : ''} × {nights} nuit{nights > 1 ? 's' : ''}</span><span>{formatPrice(extraFeePerNight * nights)}</span></div>}
                  <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-1"><span>Total</span><span>{formatPrice(totalNightPrice(nights))}</span></div>
                </div>
              )}
              {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="w-full text-white py-4 rounded-xl font-bold transition disabled:opacity-50 text-base shadow-lg" style={{ backgroundColor: color }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Redirection...
                  </span>
                ) : `Payer ${formatPrice(totalNightPrice(nights))} →`}
              </button>
              <p className="text-xs text-center text-gray-400">🔒 Paiement sécurisé par <strong>Stripe</strong></p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
