import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Resend Email Integration for GoodRunss
 * Sends transactional emails for bookings, payments, and session confirmations
 */

export interface BookingConfirmationEmail {
  trainerName: string
  trainerEmail: string
  clientName: string
  clientEmail: string
  sessionType: string
  scheduledAt: Date
  duration: number
  location?: string
  notes?: string
  bookingId: string
}

export interface PaymentReceiptEmail {
  payerName: string
  payerEmail: string
  recipientName: string
  recipientEmail: string
  amount: number
  currency: string
  sessionType: string
  transactionId: string
  paymentDate: Date
  status: 'completed' | 'pending' | 'failed'
}

/**
 * Send booking confirmation email to both trainer and client
 */
export async function sendBookingConfirmationEmails(data: BookingConfirmationEmail) {
  try {
    // Format date and time
    const dateStr = data.scheduledAt.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const timeStr = data.scheduledAt.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })

    const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Session Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">📅 Date:</td>
            <td style="padding: 10px 0; color: #333;">${dateStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">⏰ Time:</td>
            <td style="padding: 10px 0; color: #333;">${timeStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">💪 Session Type:</td>
            <td style="padding: 10px 0; color: #333;">${data.sessionType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">⌛ Duration:</td>
            <td style="padding: 10px 0; color: #333;">${data.duration} minutes</td>
          </tr>
          ${data.location ? `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">📍 Location:</td>
            <td style="padding: 10px 0; color: #333;">${data.location}</td>
          </tr>
          ` : ''}
          ${data.notes ? `
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #666;">📝 Notes:</td>
            <td style="padding: 10px 0; color: #333;">${data.notes}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <p style="margin: 0; color: #856404;">
          <strong>💡 What to bring:</strong><br>
          • Water bottle<br>
          • Comfortable workout clothes<br>
          • Positive attitude!
        </p>
      </div>

      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          Booking ID: <strong>${data.bookingId}</strong><br>
          This session was booked through <strong>GoodRunss</strong>
        </p>
        <p style="margin: 15px 0 0 0; color: #28a745; font-weight: bold;">
          Train Smarter • Train Safer • Train Better
        </p>
      </div>
    </div>
    `

    // Send email to client
    const clientResult = await resend.emails.send({
      from: 'GoodRunss <notifications@goodrunss.com>',
      to: data.clientEmail,
      subject: `Training Session Confirmed - ${dateStr}`,
      html: htmlBody,
    })

    // Log to Supabase
    await prisma.emailLog.create({
      data: {
        emailType: 'booking_confirmation',
        recipientEmail: data.clientEmail,
        subject: `Training Session Confirmed - ${dateStr}`,
        status: clientResult.error ? 'failed' : 'sent',
        metadata: {
          bookingId: data.bookingId,
          sessionType: data.sessionType,
          recipientType: 'client',
          result: JSON.parse(JSON.stringify(clientResult))
        },
        sentAt: clientResult.error ? null : new Date()
      }
    })

    console.log(`✅ Booking confirmation sent to client: ${data.clientEmail}`)

    // Send email to trainer (with different context)
    const trainerHtmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📅 New Booking!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Client Information</h2>
        <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${data.clientName}</p>
        <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${data.clientEmail}</p>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Session Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">📅 Date:</td>
            <td style="padding: 10px 0; color: #333;">${dateStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">⏰ Time:</td>
            <td style="padding: 10px 0; color: #333;">${timeStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">💪 Session Type:</td>
            <td style="padding: 10px 0; color: #333;">${data.sessionType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">⌛ Duration:</td>
            <td style="padding: 10px 0; color: #333;">${data.duration} minutes</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; padding: 20px; background: #d1ecf1; border-radius: 8px; border-left: 4px solid #0c5460;">
        <p style="margin: 0; color: #0c5460; font-weight: bold;">
          💡 Tip: Prepare your workout plan in advance to maximize the session!
        </p>
      </div>
    </div>
    `

    const trainerResult = await resend.emails.send({
      from: 'GoodRunss <notifications@goodrunss.com>',
      to: data.trainerEmail,
      subject: `New Booking - ${data.clientName}`,
      html: trainerHtmlBody,
    })

    // Log to Supabase
    await prisma.emailLog.create({
      data: {
        emailType: 'booking_confirmation',
        recipientEmail: data.trainerEmail,
        subject: `New Booking - ${data.clientName}`,
        status: trainerResult.error ? 'failed' : 'sent',
        metadata: {
          bookingId: data.bookingId,
          sessionType: data.sessionType,
          recipientType: 'trainer',
          result: JSON.parse(JSON.stringify(trainerResult))
        },
        sentAt: trainerResult.error ? null : new Date()
      }
    })

    console.log(`✅ Booking notification sent to trainer: ${data.trainerEmail}`)

    return { success: true }

  } catch (error) {
    console.error('Error sending booking confirmation emails:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send emails' }
  }
}

/**
 * Send payment receipt to both payer and recipient
 */
export async function sendPaymentReceiptEmails(data: PaymentReceiptEmail) {
  try {
    const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Successful!</h1>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 15px 0; color: #333;">Transaction Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">💰 Amount:</td>
            <td style="padding: 10px 0; color: #333;">$${data.amount.toFixed(2)} ${data.currency}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">💪 Session:</td>
            <td style="padding: 10px 0; color: #333;">${data.sessionType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">📅 Date:</td>
            <td style="padding: 10px 0; color: #333;">${data.paymentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #666;">🆔 Transaction ID:</td>
            <td style="padding: 10px 0; color: #333; font-family: monospace;">${data.transactionId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #666;">✅ Status:</td>
            <td style="padding: 10px 0; color: #28a745; font-weight: bold;">${data.status.toUpperCase()}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; padding: 20px; background: #d1ecf1; border-radius: 8px;">
        <p style="margin: 0; color: #0c5460; font-size: 14px;">
          Thank you for using <strong>GoodRunss</strong>
        </p>
      </div>
    </div>
    `

    // Send email to payer
    await resend.emails.send({
      from: 'GoodRunss <notifications@goodrunss.com>',
      to: data.payerEmail,
      subject: 'Payment Receipt - Training Session',
      html: htmlBody,
    })

    console.log(`✅ Payment receipt sent to payer: ${data.payerEmail}`)

    // Send email to recipient
    await resend.emails.send({
      from: 'GoodRunss <notifications@goodrunss.com>',
      to: data.recipientEmail,
      subject: `Payment Received - ${data.payerName}`,
      html: htmlBody,
    })

    console.log(`✅ Payment notification sent to recipient: ${data.recipientEmail}`)

    return { success: true }

  } catch (error) {
    console.error('Error sending payment receipt emails:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send emails' }
  }
}

/**
 * Generic email sender (for GIA actions)
 */
export async function sendEmail(data: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  try {
    await resend.emails.send({
      from: data.from || process.env.RESEND_FROM_EMAIL || 'anthony@goodrunss.com',
      to: data.to,
      subject: data.subject,
      html: data.html,
    })
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' }
  }
}
