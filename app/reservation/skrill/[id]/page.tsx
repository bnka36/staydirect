import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function SkrillCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { property: { include: { user: true } } },
  })

  if (!reservation || !reservation.property.user.skrillEmail) notFound()

  const { property } = reservation
  const skrillEmail = property.user.skrillEmail!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'

  const nights = reservation.nights
  const desc = `${property.name} — ${nights} nuit${nights > 1 ? 's' : ''} (${new Date(reservation.checkIn).toLocaleDateString('fr-FR')} → ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')})`

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Paiement sécurisé — {property.name}</title>
        <style>{`
          body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .card { background: white; border-radius: 20px; padding: 40px; max-width: 420px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; }
          .logo { font-size: 40px; margin-bottom: 16px; }
          h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
          .price { font-size: 36px; font-weight: 900; color: #862165; margin: 16px 0; }
          .detail { font-size: 14px; color: #64748b; margin-bottom: 8px; }
          .btn { display: block; background: #862165; color: white; font-size: 16px; font-weight: 700; padding: 16px; border-radius: 12px; border: none; cursor: pointer; width: 100%; margin-top: 24px; }
          .secure { font-size: 12px; color: #94a3b8; margin-top: 12px; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="logo">💳</div>
          <h1>Paiement sécurisé via Skrill</h1>
          <div className="detail">{property.name}</div>
          <div className="detail">{desc}</div>
          <div className="price">{reservation.totalPrice}€</div>

          <form method="POST" action="https://pay.skrill.com" id="skrill-form">
            <input type="hidden" name="pay_to_email" value={skrillEmail} />
            <input type="hidden" name="amount" value={reservation.totalPrice.toFixed(2)} />
            <input type="hidden" name="currency" value="EUR" />
            <input type="hidden" name="language" value="FR" />
            <input type="hidden" name="detail1_description" value="Logement" />
            <input type="hidden" name="detail1_text" value={property.name} />
            <input type="hidden" name="detail2_description" value="Dates" />
            <input type="hidden" name="detail2_text" value={`${new Date(reservation.checkIn).toLocaleDateString('fr-FR')} → ${new Date(reservation.checkOut).toLocaleDateString('fr-FR')}`} />
            <input type="hidden" name="detail3_description" value="Voyageur" />
            <input type="hidden" name="detail3_text" value={reservation.guestName} />
            <input type="hidden" name="merchant_fields" value="reservationId" />
            <input type="hidden" name="reservationId" value={reservation.id} />
            <input type="hidden" name="status_url" value={`${appUrl}/api/webhook/skrill`} />
            <input type="hidden" name="return_url" value={`${appUrl}/reservation/success?id=${reservation.id}`} />
            <input type="hidden" name="cancel_url" value={`${appUrl}/reservation/cancel?id=${reservation.id}`} />
            <input type="hidden" name="customer_email" value={reservation.guestEmail} />
            <button type="submit" className="btn">Payer {reservation.totalPrice}€ avec Skrill →</button>
          </form>

          <p className="secure">🔒 Paiement sécurisé · Skrill est agréé par la FCA (Royaume-Uni)</p>
        </div>
        <script dangerouslySetInnerHTML={{ __html: 'document.getElementById("skrill-form").submit();' }} />
      </body>
    </html>
  )
}
