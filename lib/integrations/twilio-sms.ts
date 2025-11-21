/**
 * Twilio SMS Integration
 * Send text message reminders and notifications to clients
 */

import twilio from 'twilio'

interface SMSData {
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
    console.warn('⚠️ Twilio initialization failed:', error)
  }
}

/**
 * Send SMS via Twilio
 */
export async function sendSMS(data: SMSData) {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.log('[SMS] Twilio not configured - would send to:', data.to)
      console.log('[SMS] Message:', data.message)
      return {
        success: false,
        message: 'SMS service not configured. Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to .env'
      }
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.error('[SMS] TWILIO_PHONE_NUMBER not configured')
      return {
        success: false,
        message: 'Twilio phone number not configured'
      }
    }

    // Validate phone number format
    if (!data.to.startsWith('+')) {
      return {
        success: false,
        message: 'Phone number must be in E.164 format (e.g., +1234567890)'
      }
    }

    // Send SMS
    const result = await twilioClient.messages.create({
      body: data.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: data.to
    })

    console.log('✅ SMS sent successfully:', result.sid)

    return {
      success: true,
      messageSid: result.sid,
      status: result.status,
      message: 'SMS sent successfully'
    }
  } catch (error: any) {
    console.error('❌ Twilio SMS error:', error)

    // Handle specific Twilio errors
    if (error.code === 21211) {
      return {
        success: false,
        message: 'Invalid phone number format'
      }
    }

    if (error.code === 21608) {
      return {
        success: false,
        message: 'Phone number is not SMS-capable'
      }
    }

    return {
      success: false,
      message: 'Failed to send SMS',
      error: error.message
    }
  }
}

/**
 * Send session reminder SMS
 */
export async function sendSessionReminderSMS(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date,
  hoursBeforeSession: number
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const message = `⏰ Reminder: You have "${sessionTitle}" with ${trainerName} in ${hoursBeforeSession} hours (${timeStr}). Reply CONFIRM to confirm or CANCEL to cancel.`

  return sendSMS({ to: clientPhone, message })
}

/**
 * Send payment reminder SMS
 */
export async function sendPaymentReminderSMS(
  clientPhone: string,
  trainerName: string,
  amount: number,
  dueDate: Date
) {
  const dateStr = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })

  const message = `💳 Payment Reminder: You have an outstanding payment of $${amount} due ${dateStr} for ${trainerName}. Please settle at your earliest convenience.`

  return sendSMS({ to: clientPhone, message })
}

/**
 * Send booking confirmation SMS
 */
export async function sendBookingConfirmationSMS(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const message = `✅ Booking Confirmed! "${sessionTitle}" with ${trainerName} on ${timeStr}. See you there!`

  return sendSMS({ to: clientPhone, message })
}

/**
 * Send cancellation SMS
 */
export async function sendCancellationSMS(
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

  let message = `❌ Session Cancelled: "${sessionTitle}" with ${trainerName} on ${timeStr} has been cancelled.`
  
  if (reason) {
    message += ` Reason: ${reason}`
  }
  
  message += ' Please contact your trainer to reschedule.'

  return sendSMS({ to: clientPhone, message })
}

/**
 * Send waitlist notification SMS
 */
export async function sendWaitlistOpeningSMS(
  clientPhone: string,
  trainerName: string,
  sessionTitle: string,
  scheduledAt: Date
) {
  const timeStr = scheduledAt.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  const message = `🎉 Spot Available! A spot opened for "${sessionTitle}" with ${trainerName} on ${timeStr}. Book now before it's gone!`

  return sendSMS({ to: clientPhone, message })
}
