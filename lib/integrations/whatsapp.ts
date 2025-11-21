/**
 * WhatsApp Business Integration
 * Send WhatsApp messages via Twilio WhatsApp Business API
 */

import twilio from 'twilio'

interface WhatsAppMessage {
  to: string // Phone number in E.164 format: +1234567890
  message: string
}

let twilioClient: any = null

// Initialize Twilio client if credentials are configured
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )
  } catch (error) {
    console.warn('⚠️ Twilio/WhatsApp initialization failed:', error)
  }
}

/**
 * Send WhatsApp message via Twilio
 */
export async function sendWhatsAppMessage(data: WhatsAppMessage) {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.log('[WhatsApp] Twilio not configured - would send to:', data.to)
      console.log('[WhatsApp] Message:', data.message)
      return {
        success: false,
        message: 'WhatsApp service not configured. Add TWILIO credentials to .env'
      }
    }

    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      console.error('[WhatsApp] TWILIO_WHATSAPP_NUMBER not configured')
      return {
        success: false,
        message: 'WhatsApp number not configured'
      }
    }

    // Validate phone number format
    if (!data.to.startsWith('+')) {
      return {
        success: false,
        message: 'Phone number must be in E.164 format (e.g., +1234567890)'
      }
    }

    // Send WhatsApp message (Twilio requires 'whatsapp:' prefix)
    const result = await twilioClient.messages.create({
      body: data.message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${data.to}`
    })

    console.log('✅ WhatsApp message sent:', result.sid)

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      message: 'WhatsApp message sent successfully'
    }
  } catch (error: any) {
    console.error('❌ WhatsApp error:', error)

    // Handle specific errors
    if (error.code === 21211) {
      return {
        success: false,
        message: 'Invalid phone number format'
      }
    }

    if (error.code === 63016) {
      return {
        success: false,
        message: 'Recipient has not opted in to receive WhatsApp messages'
      }
    }

    return {
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message
    }
  }
}

/**
 * Send session reminder via WhatsApp
 */
export async function sendSessionReminderWhatsApp(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date,
  hoursBeforeSession: number
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const message = `⏰ *Session Reminder*

Hi! This is a reminder from ${trainerName}.

You have *"${sessionTitle}"* coming up in *${hoursBeforeSession} hours*.

📅 *When:* ${timeStr}

Reply YES to confirm or NO to cancel.

See you soon! 💪`

  return sendWhatsAppMessage({ to: clientPhone, message })
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmationWhatsApp(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date,
  location?: string
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  let message = `✅ *Booking Confirmed!*

Session: *"${sessionTitle}"*
Trainer: ${trainerName}
Time: ${timeStr}`

  if (location) {
    message += `\nLocation: ${location}`
  }

  message += '\n\nYou\'ll receive a reminder 24 hours before. See you there! 🎉'

  return sendWhatsAppMessage({ to: clientPhone, message })
}

/**
 * Send payment reminder via WhatsApp
 */
export async function sendPaymentReminderWhatsApp(
  clientPhone: string,
  trainerName: string,
  amount: number,
  dueDate: Date,
  paymentLink?: string
) {
  const dateStr = dueDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  })

  let message = `💳 *Payment Reminder*

Hi! This is ${trainerName}.

You have an outstanding payment of *$${amount}* due ${dateStr}.`

  if (paymentLink) {
    message += `\n\nPay now: ${paymentLink}`
  }

  message += '\n\nThank you! 🙏'

  return sendWhatsAppMessage({ to: clientPhone, message })
}

/**
 * Send cancellation via WhatsApp
 */
export async function sendCancellationWhatsApp(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date,
  reason?: string
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  let message = `❌ *Session Cancelled*

Session: "${sessionTitle}"
Trainer: ${trainerName}
Original time: ${timeStr}`

  if (reason) {
    message += `\n\n*Reason:* ${reason}`
  }

  message += '\n\nPlease reply to reschedule. Sorry for any inconvenience!'

  return sendWhatsAppMessage({ to: clientPhone, message })
}

/**
 * Send waitlist notification via WhatsApp
 */
export async function sendWaitlistOpeningWhatsApp(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date,
  bookingLink?: string
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  let message = `🎉 *Spot Available!*

Great news! A spot just opened up:

Session: *"${sessionTitle}"*
Trainer: ${trainerName}
Time: ${timeStr}`

  if (bookingLink) {
    message += `\n\nBook now: ${bookingLink}`
  }

  message += '\n\nDon\'t wait - spots fill up fast! ⚡'

  return sendWhatsAppMessage({ to: clientPhone, message })
}

/**
 * Send progress update via WhatsApp
 */
export async function sendProgressUpdateWhatsApp(
  clientPhone: string,
  trainerName: string,
  achievements: string[],
  nextGoal: string
) {
  let message = `📊 *Progress Update from ${trainerName}*

Great work! Here's your progress:

`

  achievements.forEach((achievement, i) => {
    message += `${i + 1}. ${achievement}\n`
  })

  message += `\n🎯 *Next Goal:* ${nextGoal}

Keep up the amazing work! 💪`

  return sendWhatsAppMessage({ to: clientPhone, message })
}

