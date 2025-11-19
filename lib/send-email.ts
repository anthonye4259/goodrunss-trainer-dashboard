/**
 * Email Notification Service
 * 
 * TODO: Integrate with a real email service:
 * - Resend (https://resend.com) - Recommended, easy setup
 * - SendGrid (https://sendgrid.com)
 * - AWS SES (https://aws.amazon.com/ses/)
 * 
 * For now, logs to console and stores in database for testing
 */

interface EmailData {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(data: EmailData) {
  // Log to console for now
  console.log("📧 EMAIL NOTIFICATION:")
  console.log("To:", data.to)
  console.log("Subject:", data.subject)
  console.log("Message:", data.text)

  // TODO: Replace with real email service
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: 'GoodRunss <bookings@goodrunss.com>',
  //   to: data.to,
  //   subject: data.subject,
  //   text: data.text,
  //   html: data.html,
  // })

  return {
    success: true,
    message: "Email queued (console only - configure email service to send real emails)",
  }
}

export async function sendBookingConfirmation({
  clientName,
  clientEmail,
  trainerName,
  serviceName,
  date,
  time,
  price,
}: {
  clientName: string
  clientEmail: string
  trainerName: string
  serviceName: string
  date: string
  time: string
  price: number
}) {
  const emailText = `
Hi ${clientName},

Your booking with ${trainerName} is confirmed! 🎉

Service: ${serviceName}
Date: ${date}
Time: ${time}
Amount Paid: $${price}

You'll receive a reminder 24 hours before your session.

Questions? Reply to this email.

Best,
The GoodRunss Team
  `.trim()

  const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #10b981;">Booking Confirmed! 🎉</h2>
  
  <p>Hi ${clientName},</p>
  
  <p>Your booking with <strong>${trainerName}</strong> is confirmed!</p>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
    <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
    <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${price}</p>
  </div>
  
  <p>You'll receive a reminder 24 hours before your session.</p>
  
  <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email.</p>
  
  <p>Best,<br>The GoodRunss Team</p>
</div>
  `.trim()

  return sendEmail({
    to: clientEmail,
    subject: `Booking Confirmed with ${trainerName}`,
    text: emailText,
    html: emailHtml,
  })
}

