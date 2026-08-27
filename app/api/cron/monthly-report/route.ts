export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/admin-auth'
import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

// Called by a cron (e.g. Vercel Cron or external trigger) at the start of each month.
// Also callable manually: GET /api/cron/monthly-report?secret=...
// Optional: ?userId=<id> to send to a single user only (for testing).
export async function GET(req: Request) {
  const unauth = verifyAdmin(req)
  if (unauth) return unauth

  const { searchParams } = new URL(req.url)
  const targetUserId = searchParams.get('userId')

  // Période : mois précédent
  const now = new Date()
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const monthLabel = firstDayLastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Récupérer tous les utilisateurs actifs (ou un seul si userId fourni)
  const users = await prisma.user.findMany({
    where: {
      ...(targetUserId ? { id: targetUserId } : {}),
      plan: { not: 'livret' },
      planExpiresAt: { gt: now },
    },
    select: {
      id: true,
      name: true,
      email: true,
      properties: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          pricePerNight: true,
          reservations: {
            where: {
              status: 'confirmed',
              checkIn: { gte: firstDayLastMonth.toISOString(), lte: lastDayLastMonth.toISOString() },
            },
            select: {
              id: true,
              guestName: true,
              nights: true,
              totalPrice: true,
              checkIn: true,
            },
          },
        },
      },
    },
  })

  let sent = 0
  let skipped = 0

  for (const user of users) {
    const allReservations = user.properties.flatMap(p =>
      p.reservations.map(r => ({ ...r, propertyName: p.name }))
    )

    // Ne pas envoyer si aucune activité le mois dernier
    if (allReservations.length === 0) { skipped++; continue }

    const totalRevenue = allReservations.reduce((s, r) => s + r.totalPrice, 0)
    const totalNights = allReservations.reduce((s, r) => s + r.nights, 0)
    const bestProperty = user.properties
      .map(p => ({
        name: p.name,
        revenue: p.reservations.reduce((s, r) => s + r.totalPrice, 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)[0]

    const resend = getResend()
    await resend.emails.send({
      from: 'StayDirect <noreply@staydirect.fr>',
      to: user.email,
      subject: `📊 Votre rapport mensuel StayDirect — ${monthLabel}`,
      html: buildMonthlyReportHtml({
        ownerName: user.name || 'Propriétaire',
        monthLabel,
        totalRevenue,
        totalNights,
        totalReservations: allReservations.length,
        bestPropertyName: bestProperty?.name,
        bestPropertyRevenue: bestProperty?.revenue,
        airbnbEquiv: totalRevenue * 0.16,
        bookingEquiv: totalRevenue * 0.20,
        reservations: allReservations.slice(0, 5),
      }),
    })
    sent++
  }

  return NextResponse.json({ ok: true, sent, skipped, month: monthLabel })
}

interface ReportData {
  ownerName: string
  monthLabel: string
  totalRevenue: number
  totalNights: number
  totalReservations: number
  bestPropertyName?: string
  bestPropertyRevenue?: number
  airbnbEquiv: number
  bookingEquiv: number
  reservations: { guestName: string; propertyName: string; nights: number; totalPrice: number; checkIn: string }[]
}

function buildMonthlyReportHtml(d: ReportData): string {
  const rows = d.reservations.map(r => `
    <tr style="border-top:1px solid #f1f5f9;">
      <td style="padding:8px 12px;font-size:13px;color:#374151;">${r.guestName}</td>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;">${r.propertyName}</td>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;">${new Date(r.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
      <td style="padding:8px 12px;font-size:13px;text-align:right;font-weight:700;color:#15803d;">${fmt(r.totalPrice)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;padding:0 16px 40px;">

  <!-- Logo -->
  <div style="text-align:center;padding:32px 0 24px;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;background:#2563eb;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:white;font-weight:800;font-size:16px;">S</span>
      </div>
      <span style="font-weight:800;font-size:20px;color:#111827;">StayDirect</span>
    </div>
  </div>

  <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📊</div>
      <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Votre rapport mensuel</h1>
      <p style="color:#bfdbfe;margin:8px 0 0;font-size:15px;text-transform:capitalize;">${d.monthLabel}</p>
    </div>

    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;margin:0 0 24px;">Bonjour <strong>${d.ownerName}</strong> 👋</p>

      <!-- KPIs -->
      <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#15803d;">${fmt(d.totalRevenue)}</div>
          <div style="font-size:12px;color:#16a34a;font-weight:600;margin-top:4px;">Revenus</div>
        </div>
        <div style="flex:1;min-width:120px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#1d4ed8;">${d.totalReservations}</div>
          <div style="font-size:12px;color:#2563eb;font-weight:600;margin-top:4px;">Réservations</div>
        </div>
        <div style="flex:1;min-width:120px;background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#6d28d9;">${d.totalNights}</div>
          <div style="font-size:12px;color:#7c3aed;font-weight:600;margin-top:4px;">Nuits vendues</div>
        </div>
      </div>

      ${d.bestPropertyName ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">🏆 Meilleur logement ce mois</div>
        <div style="font-size:16px;font-weight:700;color:#0f172a;">${d.bestPropertyName}</div>
        <div style="font-size:14px;color:#16a34a;font-weight:600;">${fmt(d.bestPropertyRevenue || 0)} de revenus</div>
      </div>` : ''}

      <!-- Tableau réservations -->
      ${rows ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Réservations du mois</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#94a3b8;font-weight:600;">Voyageur</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#94a3b8;font-weight:600;">Logement</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#94a3b8;font-weight:600;">Date</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#94a3b8;font-weight:600;">Montant</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>` : ''}

      <!-- Économies -->
      <div style="background:linear-gradient(135deg,#059669,#047857);border-radius:14px;padding:20px;margin-bottom:24px;">
        <div style="color:#a7f3d0;font-size:12px;font-weight:700;text-transform:uppercase;margin-bottom:12px;">💚 Économies réalisées ce mois vs plateformes OTA</div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;background:rgba(255,255,255,0.15);border-radius:10px;padding:12px;text-align:center;">
            <div style="color:white;font-size:20px;font-weight:800;">${fmt(d.airbnbEquiv)}</div>
            <div style="color:#a7f3d0;font-size:11px;margin-top:2px;">Économisé vs Airbnb</div>
          </div>
          <div style="flex:1;background:rgba(255,255,255,0.15);border-radius:10px;padding:12px;text-align:center;">
            <div style="color:white;font-size:20px;font-weight:800;">${fmt(d.bookingEquiv)}</div>
            <div style="color:#a7f3d0;font-size:11px;margin-top:2px;">Économisé vs Booking</div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;">
        <a href="https://staydirect.fr/dashboard"
           style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;">
          Voir mon dashboard →
        </a>
      </div>
    </div>

    <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#cbd5e1;font-size:12px;margin:0;">
        <strong style="color:#94a3b8;">StayDirect</strong> · staydirect.fr ·
        <a href="https://staydirect.fr/dashboard?tab=settings" style="color:#94a3b8;">Se désabonner des rapports</a>
      </p>
    </div>
  </div>
</div>
</body>
</html>`
}
