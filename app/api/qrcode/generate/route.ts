import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import QRCode from 'qrcode'
import { Resend } from 'resend'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 })

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 402 })
  }

  const url = session.metadata?.url
  const email = session.metadata?.email

  if (!url || !email) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  })

  // Envoyer par email
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'StayDirect <noreply@staydirect.fr>',
    to: email,
    subject: '✅ Votre QR Code est prêt !',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:500px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:#1e40af;padding:32px;text-align:center;">
    <span style="color:white;font-size:24px;font-weight:700;">StayDirect</span>
  </div>
  <div style="padding:40px;text-align:center;">
    <h2 style="color:#111827;margin-bottom:8px;">Votre QR Code est prêt !</h2>
    <p style="color:#6b7280;margin-bottom:24px;">Scannez ce QR code ou imprimez-le pour diriger vos clients vers :</p>
    <p style="background:#f3f4f6;padding:12px;border-radius:8px;font-size:13px;color:#374151;word-break:break-all;margin-bottom:24px;">${url}</p>
    <img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px;border:4px solid #e5e7eb;border-radius:12px;" />
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;" />
    <p style="color:#6b7280;font-size:14px;">Vous souhaitez une page de réservation complète pour recevoir des paiements directement ?</p>
    <a href="https://staydirect.fr/register" style="display:inline-block;margin-top:16px;background:#1e40af;color:white;padding:14px 28px;border-radius:10px;font-weight:600;text-decoration:none;">
      Essai gratuit 14 jours →
    </a>
  </div>
</div>
</body>
</html>`,
  })

  return NextResponse.json({ qrDataUrl, url })
}
