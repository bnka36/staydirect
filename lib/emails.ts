import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const fmtShort = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

interface ReservationEmailData {
  guestName: string
  guestEmail: string
  guestPhone?: string
  propertyName: string
  propertyCity?: string
  ownerName: string
  ownerEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  reservationId?: string
}

// ─────────────────────────────────────────
// EMAIL CONFIRMATION VOYAGEUR
// ─────────────────────────────────────────
export async function sendConfirmationToGuest(data: ReservationEmailData) {
  await getResend().emails.send({
    from: `${data.ownerName || 'StayDirect'} <noreply@staydirect.fr>`,
    replyTo: data.ownerEmail,
    to: data.guestEmail,
    subject: `✅ Réservation confirmée — ${data.propertyName}`,
    html: `<!DOCTYPE html>
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

  <!-- Card principale -->
  <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header vert -->
    <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">✅</div>
      <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Réservation confirmée !</h1>
      <p style="color:#bfdbfe;margin:8px 0 0;font-size:15px;">Votre séjour est réservé et payé</p>
    </div>

    <!-- Contenu -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;margin:0 0 8px;">Bonjour <strong>${data.guestName}</strong> 👋</p>
      <p style="color:#6b7280;margin:0 0 24px;line-height:1.6;">Votre réservation a bien été confirmée. Voici votre récapitulatif :</p>

      <!-- Logement -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">Votre logement</div>
        <div style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:4px;">🏠 ${data.propertyName}</div>
        ${data.propertyCity ? `<div style="color:#64748b;font-size:14px;">📍 ${data.propertyCity}</div>` : ''}
      </div>

      <!-- Dates -->
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        <div style="flex:1;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:6px;">Arrivée</div>
          <div style="font-weight:800;color:#0c4a6e;font-size:15px;">${fmtShort(data.checkIn)}</div>
        </div>
        <div style="display:flex;align-items:center;color:#94a3b8;font-size:20px;">→</div>
        <div style="flex:1;background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;font-weight:700;color:#0369a1;text-transform:uppercase;margin-bottom:6px;">Départ</div>
          <div style="font-weight:800;color:#0c4a6e;font-size:15px;">${fmtShort(data.checkOut)}</div>
        </div>
      </div>

      <!-- Prix -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:13px;color:#16a34a;font-weight:600;">${data.nights} nuit${data.nights > 1 ? 's' : ''} · Paiement confirmé ✓</div>
          <div style="font-size:12px;color:#86efac;margin-top:2px;">Aucun frais de service</div>
        </div>
        <div style="font-size:28px;font-weight:800;color:#15803d;">${fmt(data.totalPrice)}</div>
      </div>

      <!-- Contact hôte -->
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:600;color:#6b7280;margin-bottom:8px;">Votre hôte</div>
        <div style="font-weight:600;color:#111827;">${data.ownerName}</div>
        <a href="mailto:${data.ownerEmail}" style="color:#2563eb;font-size:14px;">${data.ownerEmail}</a>
      </div>

      <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">Pour toute question, contactez directement votre hôte.</p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#cbd5e1;font-size:12px;margin:0;">Réservation via <strong style="color:#94a3b8;">StayDirect</strong> · staydirect.fr · Réservations directes sans commission</p>
    </div>
  </div>
</div>
</body>
</html>`,
  })
}

// ─────────────────────────────────────────
// EMAIL NOTIFICATION PROPRIÉTAIRE
// ─────────────────────────────────────────
export async function sendNotificationToOwner(data: ReservationEmailData) {
  await getResend().emails.send({
    from: `${data.ownerName || 'StayDirect'} <noreply@staydirect.fr>`,
    replyTo: data.ownerEmail,
    to: data.ownerEmail,
    subject: `💰 Nouvelle réservation — ${fmt(data.totalPrice)} — ${data.propertyName}`,
    html: `<!DOCTYPE html>
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

  <!-- Card -->
  <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#059669,#047857);padding:36px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Nouvelle réservation !</h1>
      <p style="color:#a7f3d0;margin:8px 0 0;font-size:15px;">Réservation directe · 0% de commission</p>
    </div>

    <!-- Montant mis en avant -->
    <div style="background:#f0fdf4;border-bottom:1px solid #dcfce7;padding:24px 32px;text-align:center;">
      <div style="font-size:13px;color:#16a34a;font-weight:600;margin-bottom:4px;">MONTANT REÇU</div>
      <div style="font-size:44px;font-weight:900;color:#15803d;">${fmt(data.totalPrice)}</div>
      <div style="font-size:13px;color:#86efac;margin-top:4px;">Versement sous 2-7 jours ouvrés sur Stripe</div>
    </div>

    <!-- Contenu -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;margin:0 0 20px;">Bonjour <strong>${data.ownerName}</strong> 👋</p>

      <!-- Détails réservation -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:24px;margin-bottom:20px;">
        <div style="font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:16px;">Détails de la réservation</div>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">🏠 Logement</td>
            <td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${data.propertyName}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">👤 Voyageur</td>
            <td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${data.guestName}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">📧 Email</td>
            <td style="padding:8px 0;text-align:right;"><a href="mailto:${data.guestEmail}" style="color:#2563eb;">${data.guestEmail}</a></td>
          </tr>
          ${data.guestPhone ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 0;color:#6b7280;font-size:14px;">📞 Téléphone</td><td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${data.guestPhone}</td></tr>` : ''}
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">📅 Arrivée</td>
            <td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${fmtDate(data.checkIn)}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">📅 Départ</td>
            <td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${fmtDate(data.checkOut)}</td>
          </tr>
          <tr style="border-top:1px solid #f1f5f9;">
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">🌙 Durée</td>
            <td style="padding:8px 0;font-weight:700;color:#0f172a;text-align:right;">${data.nights} nuit${data.nights > 1 ? 's' : ''}</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://staydirect.fr/dashboard" style="display:inline-block;background:#2563eb;color:white;padding:14px 32px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;">
          Voir dans le dashboard →
        </a>
      </div>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
        <p style="margin:0;font-size:13px;color:#92400e;">💡 <strong>Rappel :</strong> Vous avez reçu cette réservation sans payer de commission. Airbnb vous aurait prélevé ~16% sur ce montant.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#cbd5e1;font-size:12px;margin:0;"><strong style="color:#94a3b8;">StayDirect</strong> · staydirect.fr · Réservations directes sans commission</p>
    </div>
  </div>
</div>
</body>
</html>`,
  })
}

// ─────────────────────────────────────────
// EMAIL RAPPEL 24H AVANT ARRIVÉE (voyageur)
// ─────────────────────────────────────────
export async function sendCheckinReminder(data: ReservationEmailData) {
  await getResend().emails.send({
    from: `${data.ownerName || 'StayDirect'} <noreply@staydirect.fr>`,
    replyTo: data.ownerEmail,
    to: data.guestEmail,
    subject: `⏰ Rappel — Votre arrivée demain à ${data.propertyName}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<div style="max-width:600px;margin:40px auto;padding:0 16px 40px;">
  <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">⏰</div>
      <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">Votre séjour commence demain !</h1>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#374151;">Bonjour <strong>${data.guestName}</strong>,</p>
      <p style="color:#6b7280;line-height:1.6;">Nous vous rappelons que votre séjour à <strong>${data.propertyName}</strong> commence <strong>demain le ${fmtShort(data.checkIn)}</strong>.</p>

      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:12px;padding:20px;margin:20px 0;">
        <div style="font-weight:700;color:#7c3aed;margin-bottom:8px;">📋 Récapitulatif</div>
        <div style="color:#374151;font-size:14px;line-height:2;">
          🏠 <strong>${data.propertyName}</strong><br>
          📅 Arrivée : <strong>${fmtShort(data.checkIn)}</strong><br>
          📅 Départ : <strong>${fmtShort(data.checkOut)}</strong><br>
          🌙 <strong>${data.nights} nuit${data.nights > 1 ? 's' : ''}</strong>
        </div>
      </div>

      <p style="color:#6b7280;font-size:14px;">Pour toute question de dernière minute, contactez votre hôte :<br>
      <a href="mailto:${data.ownerEmail}" style="color:#7c3aed;font-weight:600;">${data.ownerName} — ${data.ownerEmail}</a></p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#cbd5e1;font-size:12px;margin:0;"><strong style="color:#94a3b8;">StayDirect</strong> · staydirect.fr</p>
    </div>
  </div>
</div>
</body>
</html>`,
  })
}

// ─────────────────────────────────────────
// NOTIFICATION NOUVEAU MESSAGE DE CONTACT
// ─────────────────────────────────────────
export async function sendContactNotification(data: {
  name: string
  email: string
  phone?: string
  plan?: string
  message: string
  adminEmail: string
}) {
  const planLabels: Record<string, string> = {
    solo: 'Solo — 19€/mois',
    petit: 'Petit propriétaire — 39€/mois',
    pro: 'Pro / Agence — 69€/mois',
    livret: "Livret d'accueil — 4.90€/mois",
    autre: 'Autre',
  }

  await getResend().emails.send({
    from: 'StayDirect <noreply@staydirect.fr>',
    replyTo: data.email,
    to: data.adminEmail,
    subject: `📬 Nouveau message de ${data.name}`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;text-align:center;">
    <p style="font-size:40px;margin:0 0 12px;">📬</p>
    <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">Nouveau message reçu</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0;">staydirect.fr</p>
  </div>
  <div style="padding:32px;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Nom</span><br>
        <span style="color:#0f172a;font-size:16px;font-weight:700;">${data.name}</span>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Email</span><br>
        <a href="mailto:${data.email}" style="color:#2563eb;font-size:16px;font-weight:700;">${data.email}</a>
      </td></tr>
      ${data.phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Téléphone</span><br>
        <a href="tel:${data.phone}" style="color:#0f172a;font-size:16px;font-weight:700;">${data.phone}</a>
      </td></tr>` : ''}
      ${data.plan ? `<tr><td style="padding:10px 0;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Intéressé par</span><br>
        <span style="background:#eff6ff;color:#2563eb;font-size:14px;font-weight:700;padding:4px 12px;border-radius:20px;display:inline-block;margin-top:4px;">${planLabels[data.plan] || data.plan}</span>
      </td></tr>` : ''}
    </table>
    <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:20px;">
      <p style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 10px;">Message</p>
      <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0;white-space:pre-line;">${data.message}</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="mailto:${data.email}?subject=Re: Votre demande StayDirect"
         style="background:#2563eb;color:white;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;display:inline-block;">
        ↩️ Répondre à ${data.name}
      </a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="color:#cbd5e1;font-size:12px;margin:0;"><strong style="color:#94a3b8;">StayDirect Admin</strong> · staydirect.fr</p>
  </div>
</div>
</body></html>`,
  })
}

export async function sendGuestMessageToOwner(data: {
  guestName: string
  guestEmail: string
  guestPhone?: string
  message: string
  propertyName: string
  ownerEmail: string
  ownerName: string
}) {
  await getResend().emails.send({
    from: `${data.ownerName || 'StayDirect'} <noreply@staydirect.fr>`,
    replyTo: data.guestEmail,
    to: data.ownerEmail,
    subject: `💬 Message de ${data.guestName} pour "${data.propertyName}"`,
    html: `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#1e40af,#2563eb);padding:32px;text-align:center;">
    <p style="font-size:40px;margin:0 0 12px;">💬</p>
    <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">Nouveau message voyageur</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0;">${data.propertyName}</p>
  </div>
  <div style="padding:32px;">
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Voyageur</span><br>
        <span style="color:#0f172a;font-size:16px;font-weight:700;">${data.guestName}</span>
      </td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Email</span><br>
        <a href="mailto:${data.guestEmail}" style="color:#2563eb;font-size:16px;font-weight:700;">${data.guestEmail}</a>
      </td></tr>
      ${data.guestPhone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
        <span style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;">Téléphone</span><br>
        <a href="tel:${data.guestPhone}" style="color:#0f172a;font-size:16px;font-weight:700;">${data.guestPhone}</a>
      </td></tr>` : ''}
    </table>
    <div style="background:#f8fafc;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:20px;">
      <p style="color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;margin:0 0 10px;">Message</p>
      <p style="color:#1e293b;font-size:15px;line-height:1.7;margin:0;white-space:pre-line;">${data.message}</p>
    </div>
    <div style="text-align:center;margin-top:28px;">
      <a href="mailto:${data.guestEmail}?subject=Re: Votre demande pour ${data.propertyName}"
         style="background:#2563eb;color:white;font-size:15px;font-weight:700;padding:14px 36px;border-radius:12px;text-decoration:none;display:inline-block;">
        ↩️ Répondre à ${data.guestName}
      </a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="color:#cbd5e1;font-size:12px;margin:0;">Message reçu via <strong style="color:#94a3b8;">StayDirect</strong> · staydirect.fr</p>
  </div>
</div>
</body></html>`,
  })
}

export async function sendNewUserNotification(data: { name: string; email: string }) {
  const adminEmail = process.env.ADMIN_EMAIL || 'bnk.a36@gmail.com'
  await getResend().emails.send({
    from: `${data.ownerName || 'StayDirect'} <noreply@staydirect.fr>`,
    replyTo: data.ownerEmail,
    to: adminEmail,
    subject: `🎉 Nouveau client — ${data.name}`,
    html: `<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:28px 32px;">
    <div style="font-size:28px;margin-bottom:8px;">🎉</div>
    <h1 style="color:white;font-size:20px;font-weight:700;margin:0;">Nouveau client inscrit</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#64748b;font-size:14px;margin:0 0 20px;">Un nouveau client vient de créer un compte sur StayDirect.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px;font-weight:600;">Nom</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;font-weight:600;">${data.name}</td></tr>
      <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;font-weight:600;">Email</td><td style="padding:10px 0;color:#2563eb;font-size:14px;"><a href="mailto:${data.email}" style="color:#2563eb;">${data.email}</a></td></tr>
    </table>
    <div style="margin-top:24px;text-align:center;">
      <a href="https://www.staydirect.fr/admin" style="background:#2563eb;color:white;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;display:inline-block;">Voir dans l'admin →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:14px 32px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="color:#cbd5e1;font-size:11px;margin:0;">StayDirect Admin · staydirect.fr</p>
  </div>
</div>`,
  })
}
