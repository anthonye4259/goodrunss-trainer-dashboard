/**
 * Email Notification Service
 * 
 * Uses Resend if RESEND_API_KEY is configured, otherwise logs to console
 * Setup: https://resend.com → Get API key → Add to .env
 */

interface EmailData {
  to: string
  subject: string
  text: string
  html?: string
}

const RESEND_ENABLED = !!process.env.RESEND_API_KEY

// Lazy load Resend only if configured
let Resend: any = null
let resend: any = null

if (RESEND_ENABLED) {
  try {
    Resend = require("resend").Resend
    resend = new Resend(process.env.RESEND_API_KEY)
  } catch (error) {
    console.warn("⚠️ Resend not installed. Run: npm install resend")
  }
}

export async function sendEmail(data: EmailData) {
  // If Resend is configured, send real email
  if (resend) {
    try {
      const { data: emailData, error } = await resend.emails.send({
        from: "GoodRunss <bookings@goodrunss.com>",
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
      })

      if (error) {
        console.error("❌ Resend error:", error)
        return {
          success: false,
          message: "Failed to send email",
          error,
        }
      }

      console.log("✅ Email sent via Resend:", emailData?.id)
      return {
        success: true,
        message: "Email sent successfully",
        id: emailData?.id,
      }
    } catch (error) {
      console.error("❌ Failed to send email:", error)
      return {
        success: false,
        message: "Failed to send email",
        error,
      }
    }
  }

  // Fallback: Log to console
  console.log("📧 EMAIL NOTIFICATION (Console Mode - Add RESEND_API_KEY to .env for real emails):")
  console.log("To:", data.to)
  console.log("Subject:", data.subject)
  console.log("Message:", data.text)
  console.log("---")

  return {
    success: true,
    message: "Email logged to console (add RESEND_API_KEY for real emails)",
    mode: "console",
  }
}

/**
 * Check if email service is configured
 */
export function isEmailEnabled(): boolean {
  return RESEND_ENABLED && resend !== null
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

