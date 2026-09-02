export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { Resend } from 'resend'

// Calcul des frais selon abonnement
function calculateFee(amount: number, isSubscriber: boolean) {
  const percent = isSubscriber ? 0.99 : 1.5
  const fee = Math.round((0.25 + (amount * percent / 100)) * 100) / 100
  return { fee, percent }
}

// GET — lister toutes les cautions du proprio
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const deposits = await prisma.securityDeposit.findMany({
    where: { userId: session.user.id },
    include: { property: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(deposits)
}

// POST — créer une demande de caution
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { guestName, guestEmail, guestPhone, amount, propertyId, checkIn, checkOut, note } = await req.json()

  if (!guestName || !guestEmail || !amount) {
    return NextResponse.json({ error: 'Nom, email et montant requis' }, { status: 400 })
  }

  // Vérifier si l'utilisateur est abonné
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  const isSubscriber = !!(user?.plan && user.plan !== 'starter')

  // La caution appartient à l'hôte, pas à StayDirect : elle doit transiter par son
  // compte Stripe Connect (StayDirect ne doit jamais encaisser pour le compte d'un tiers).
  if (!user?.stripeConnectId) {
    return NextResponse.json({ error: 'Connectez d\'abord votre compte Stripe (Paramètres) pour pouvoir demander une caution.' }, { status: 400 })
  }

  // Calculer les frais voyageur
  const { fee, percent } = calculateFee(amount, isSubscriber)
  const totalAmount = Math.round((amount + fee) * 100) / 100

  // Créer le PaymentIntent Stripe (préautorisation = capture manuelle) directement sur le
  // compte Connect de l'hôte : StayDirect ne fait que prélever ses frais de service
  // (application_fee_amount), l'argent de la caution ne transite jamais par son propre compte.
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'eur',
    capture_method: 'manual',
    payment_method_types: ['card'],
    transfer_data: { destination: user.stripeConnectId },
    metadata: {
      userId: session.user.id,
      guestName,
      guestEmail,
      depositAmount: amount,
      feeAmount: fee,
      type: 'security_deposit',
    },
    description: `Caution ${amount}€ + frais ${fee}€ — ${guestName}`,
    receipt_email: guestEmail,
  })

  // Expiration dans 7 jours
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const deposit = await prisma.securityDeposit.create({
    data: {
      userId: session.user.id,
      propertyId: propertyId || null,
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      amount,
      feeAmount: fee,
      feePercent: percent,
      isSubscriber,
      checkIn: checkIn ? new Date(checkIn) : null,
      checkOut: checkOut ? new Date(checkOut) : null,
      note: note || null,
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret,
      status: 'pending',
      expiresAt,
    },
  })

  // Email au voyageur
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://staydirect.fr'
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'StayDirect <noreply@staydirect.fr>',
      to: guestEmail,
      subject: `🔒 Dépôt de garantie requis — ${amount}€`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;text-align:center;">
    <p style="font-size:48px;margin:0 0 16px;">🔒</p>
    <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">Dépôt de garantie</h1>
    <p style="color:rgba(255,255,255,0.8);font-size:15px;margin:8px 0 0;">Bonjour ${guestName}</p>
  </div>
  <div style="padding:32px;">
    <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Votre hôte vous demande de pré-autoriser un dépôt de garantie avant votre arrivée.
      <strong>Votre carte ne sera pas débitée</strong> sauf en cas de dommages constatés.
    </p>

    <div style="background:#f8fafc;border-radius:16px;padding:20px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#64748b;font-size:14px;padding:6px 0;">Dépôt de garantie</td>
          <td style="color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${amount}€</td>
        </tr>
        <tr>
          <td style="color:#64748b;font-size:14px;padding:6px 0;">Frais de service (${percent}% + 0.25€)</td>
          <td style="color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${fee}€</td>
        </tr>
        <tr style="border-top:2px solid #e2e8f0;">
          <td style="color:#0f172a;font-size:16px;font-weight:800;padding:10px 0 0;">Total bloqué</td>
          <td style="color:#1e40af;font-size:20px;font-weight:900;text-align:right;padding-top:10px;">${totalAmount}€</td>
        </tr>
      </table>
    </div>

    <div style="background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="color:#92400e;font-size:13px;margin:0;">
        ⚠️ <strong>Important :</strong> Aucun débit immédiat. Le montant est libéré après votre séjour si aucun dommage n'est constaté. Cette autorisation expire dans 7 jours.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${appUrl}/caution/${deposit.id}"
         style="background:#2563eb;color:white;font-size:16px;font-weight:700;padding:16px 48px;border-radius:14px;text-decoration:none;display:inline-block;">
        🔒 Valider mon dépôt de garantie
      </a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="color:#cbd5e1;font-size:12px;margin:0;"><strong style="color:#94a3b8;">StayDirect</strong> · Paiements sécurisés par Stripe</p>
  </div>
</div>
</body></html>`,
    })
  } catch (e) {
    console.error('Email deposit error:', e)
  }

  return NextResponse.json({ id: deposit.id, url: `${appUrl}/caution/${deposit.id}`, fee, totalAmount })
}
