'use client'
import { useState } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { BookingModal, type Owner, type Property } from '@/app/p/[slug]/_components/ThemeWrapper'

const UI = {
  fr: { book: 'Réserver →', guests: 'voyageurs max', perNight: '/ nuit', noFees: '0% commission', poweredBy: 'Propulsé par' },
  en: { book: 'Book →', guests: 'guests max', perNight: '/ night', noFees: '0% commission', poweredBy: 'Powered by' },
  es: { book: 'Reservar →', guests: 'huéspedes máx.', perNight: '/ noche', noFees: '0% comisión', poweredBy: 'Impulsado por' },
}

export default function EmbedWidget({ owner }: { owner: Owner }) {
  const color = owner.primaryColor || '#2563eb'
  const lang = (owner.lang || 'fr') as keyof typeof UI
  const t = UI[lang] || UI.fr
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null)

  if (!owner.properties.length) {
    return <div className="p-6 text-center text-gray-400 text-sm">Aucun logement disponible.</div>
  }

  return (
    <div className="bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="p-3 space-y-3">
        {owner.properties.map(property => (
          <EmbedPropertyCard key={property.id} property={property} color={color} t={t} onBook={() => setBookingProperty(property)} />
        ))}
      </div>

      <div className="text-center pb-3">
        <a href="https://www.staydirect.fr" target="_blank" rel="noopener noreferrer" className="text-[11px] text-gray-400 hover:text-gray-600 transition">
          {t.poweredBy} <span className="font-semibold">StayDirect</span>
        </a>
      </div>

      {bookingProperty && (
        <BookingModal property={bookingProperty} color={color} lang={lang} onClose={() => setBookingProperty(null)} />
      )}
    </div>
  )
}

function EmbedPropertyCard({ property, color, t, onBook }: { property: Property; color: string; t: typeof UI['fr']; onBook: () => void }) {
  const img = property.images?.[0]
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div className="relative h-40 bg-gray-100">
        {img ? (
          <Image src={img} alt={property.name} fill className="object-cover" sizes="(max-width: 600px) 100vw, 480px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">🏠</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-bold tracking-wide uppercase text-gray-400 mb-1">📍 {property.city}</p>
        <h3 className="text-[16px] font-black text-gray-900 mb-2 leading-tight">{property.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-100">👥 {property.maxGuests} {t.guests}</span>
          <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-100">{t.noFees}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[19px] font-black text-gray-900">{formatPrice(property.pricePerNight)}</span>
            <span className="text-gray-400 text-[12px] ml-1">{t.perNight}</span>
          </div>
          <button
            onClick={onBook}
            className="text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition"
            style={{ backgroundColor: color, boxShadow: `0 4px 14px ${color}55` }}
          >
            {t.book}
          </button>
        </div>
      </div>
    </div>
  )
}
