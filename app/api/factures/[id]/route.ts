export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TVA_HEBERGEMENT = 0.10

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  const { id } = await params

  const reservation = await prisma.reservation.findFirst({
    where: { id, property: { userId: session.user.id } },
    include: { property: { include: { user: { select: { name: true, email: true, phone: true } } } } },
  })

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })

  const user = reservation.property.user
  const totalTTC = reservation.totalPrice
  const ht = Math.round((totalTTC / 1.10) * 100) / 100
  const tva = Math.round((totalTTC - ht) * 100) / 100
  const prixNuitHT = Math.round((ht / reservation.nights) * 100) / 100
  const prixNuitTVA = Math.round((tva / reservation.nights) * 100) / 100

  const facNum = `FAC-${new Date(reservation.createdAt).getFullYear()}-${reservation.id.slice(-6).toUpperCase()}`
  const dateFacture = new Date(reservation.createdAt).toLocaleDateString('fr-FR')
  const dateArrivee = new Date(reservation.checkIn).toLocaleDateString('fr-FR')
  const dateDepart = new Date(reservation.checkOut).toLocaleDateString('fr-FR')

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Facture ${facNum}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: white; padding: 40px; font-size: 13px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #1a1a1a; }
  .brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .brand span { color: #2563eb; }
  .facture-title { text-align: right; }
  .facture-title h1 { font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
  .facture-title .num { font-size: 13px; color: #666; margin-top: 4px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 36px; }
  .meta-block h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; }
  .meta-block p { line-height: 1.6; }
  .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 6px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #1a1a1a; color: white; }
  thead th { padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
  tbody tr { border-bottom: 1px solid #f0f0f0; }
  tbody td { padding: 12px 14px; }
  .totaux { margin-left: auto; width: 300px; }
  .totaux-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
  .totaux-row.total { border-top: 2px solid #1a1a1a; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 16px; }
  .tva-detail { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-top: 24px; margin-bottom: 24px; }
  .tva-detail h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 10px; }
  .tva-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; }
  .tva-cell { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb; }
  .tva-cell .label { font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
  .tva-cell .val { font-weight: 700; font-size: 15px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #888; font-size: 11px; text-align: center; line-height: 1.8; }
  @media print {
    body { padding: 20px; }
    @page { margin: 1cm; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="brand">Stay<span>Direct</span></div>
  <div class="facture-title">
    <h1>Facture</h1>
    <div class="num">${facNum} · ${dateFacture}</div>
  </div>
</div>

<div class="meta">
  <div class="meta-block">
    <h3>Prestataire</h3>
    <p><strong>${user.name || reservation.property.name}</strong><br>
    ${reservation.property.name}<br>
    ${reservation.property.city}<br>
    ${user.email}<br>
    ${user.phone || ''}</p>
  </div>
  <div class="meta-block">
    <h3>Client</h3>
    <p><strong>${reservation.guestName}</strong><br>
    ${reservation.guestEmail}<br>
    ${reservation.guestPhone || ''}</p>
    <span class="badge">✓ Payé</span>
  </div>
  <div class="meta-block" style="text-align:right">
    <h3>Détails séjour</h3>
    <p>Arrivée : <strong>${dateArrivee}</strong><br>
    Départ : <strong>${dateDepart}</strong><br>
    Durée : <strong>${reservation.nights} nuit${reservation.nights > 1 ? 's' : ''}</strong><br>
    Source : ${reservation.source}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Désignation</th>
      <th>TVA</th>
      <th>Prix HT/nuit</th>
      <th>Nuits</th>
      <th>Total HT</th>
      <th>TVA</th>
      <th>Total TTC</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>${reservation.property.name}</strong><br><span style="color:#666;font-size:12px">Hébergement · du ${dateArrivee} au ${dateDepart}</span></td>
      <td>10%</td>
      <td>${prixNuitHT.toFixed(2)} €</td>
      <td>${reservation.nights}</td>
      <td>${ht.toFixed(2)} €</td>
      <td>${tva.toFixed(2)} €</td>
      <td><strong>${totalTTC.toFixed(2)} €</strong></td>
    </tr>
  </tbody>
</table>

<div class="totaux">
  <div class="totaux-row"><span>Sous-total HT</span><span>${ht.toFixed(2)} €</span></div>
  <div class="totaux-row"><span>TVA 10% (hébergement)</span><span>${tva.toFixed(2)} €</span></div>
  <div class="totaux-row total"><span>TOTAL TTC</span><span>${totalTTC.toFixed(2)} €</span></div>
</div>

<div class="tva-detail">
  <h3>Récapitulatif TVA</h3>
  <div class="tva-grid">
    <div class="tva-cell"><div class="label">Base HT</div><div class="val">${ht.toFixed(2)} €</div></div>
    <div class="tva-cell"><div class="label">Taux TVA</div><div class="val">10%</div></div>
    <div class="tva-cell"><div class="label">Montant TVA</div><div class="val">${tva.toFixed(2)} €</div></div>
    <div class="tva-cell"><div class="label">Total TTC</div><div class="val">${totalTTC.toFixed(2)} €</div></div>
  </div>
</div>

<div class="footer">
  TVA non applicable si micro-entrepreneur · Article 293 B du CGI<br>
  StayDirect.fr · Plateforme de réservation directe sans commission<br>
  Facture générée le ${new Date().toLocaleDateString('fr-FR')} via StayDirect
</div>

<script>window.onload = () => window.print()</script>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
