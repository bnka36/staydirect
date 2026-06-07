import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

interface ReservationEmailData {
  guestName: string
  guestEmail: string
  propertyName: string
  ownerName: string
  ownerEmail: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
}

export async function sendConfirmationToGuest(data: ReservationEmailData) {
  await getResend().emails.send({
    from: 'StayDirect <noreply@staydirect.fr>',
    to: data.guestEmail,
    subject: `✅ Réservation confirmée — ${data.propertyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Réservation confirmée !</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151;">Bonjour <strong>${data.guestName}</strong>,</p>
          <p style="color: #6b7280;">Votre réservation a bien été confirmée. Voici le récapitulatif :</p>

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">🏠 ${data.propertyName}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Arrivée</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827; text-align: right;">${new Date(data.checkIn).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Départ</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827; text-align: right;">${new Date(data.checkOut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Durée</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827; text-align: right;">${data.nights} nuit${data.nights > 1 ? 's' : ''}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 12px 0 0 0; color: #111827; font-weight: bold; font-size: 16px;">Total payé</td>
                <td style="padding: 12px 0 0 0; font-weight: bold; color: #2563eb; text-align: right; font-size: 18px;">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.totalPrice)}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280;">Pour toute question, contactez directement votre hôte : <a href="mailto:${data.ownerEmail}" style="color: #2563eb;">${data.ownerEmail}</a></p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">Réservation effectuée via <strong>StayDirect</strong> · staydirect.fr</p>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendNotificationToOwner(data: ReservationEmailData) {
  await getResend().emails.send({
    from: 'StayDirect <noreply@staydirect.fr>',
    to: data.ownerEmail,
    subject: `🎉 Nouvelle réservation — ${data.propertyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Nouvelle réservation !</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #374151;">Bonjour <strong>${data.ownerName}</strong>,</p>
          <p style="color: #6b7280;">Vous avez reçu une nouvelle réservation directe !</p>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827;">📋 Détails</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Logement</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827; text-align: right;">${data.propertyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Voyageur</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827; text-align: right;">${data.guestName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email</td>
                <td style="padding: 8px 0; color: #2563eb; text-align: right;"><a href="mailto:${data.guestEmail}">${data.guestEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Arrivée</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(data.checkIn).toLocaleDateString('fr-FR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Départ</td>
                <td style="padding: 8px 0; font-weight: bold; text-align: right;">${new Date(data.checkOut).toLocaleDateString('fr-FR')}</td>
              </tr>
              <tr style="border-top: 1px solid #bbf7d0;">
                <td style="padding: 12px 0 0 0; font-weight: bold; font-size: 16px;">Montant reçu</td>
                <td style="padding: 12px 0 0 0; font-weight: bold; color: #059669; text-align: right; font-size: 18px;">${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.totalPrice)}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; font-size: 14px;">L'argent sera versé sur votre compte Stripe dans 2-7 jours ouvrés.</p>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">StayDirect · staydirect.fr</p>
          </div>
        </div>
      </div>
    `,
  })
}
