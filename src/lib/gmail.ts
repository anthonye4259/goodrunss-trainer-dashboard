/**
 * Gmail Integration
 * Send professional emails for booking confirmations and notifications
 */

import { google } from 'googleapis'

const gmail = google.gmail('v1')

/**
 * Get OAuth2 client with user's access token
 */
function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  
  oauth2Client.setCredentials({
    access_token: accessToken,
  })
  
  return oauth2Client
}

/**
 * Create email message in base64 format
 */
function createMessage(to: string, from: string, subject: string, body: string) {
  const message = [
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n')
  
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Send booking confirmation email to client
 */
export async function sendBookingConfirmation(
  accessToken: string,
  trainerEmail: string,
  trainerName: string,
  clientEmail: string,
  clientName: string,
  bookingDetails: {
    sessionType: string
    scheduledAt: Date
    duration: number
    location?: string
    notes?: string
  }
) {
  try {
    const auth = getOAuth2Client(accessToken)
    
    const subject = `Training Session Confirmed - ${bookingDetails.scheduledAt.toLocaleDateString()}`
    
    const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .detail-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
    .label { font-weight: bold; color: #22c55e; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: #22c55e; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Training Session Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>
      
      <p>Your training session with <strong>${trainerName}</strong> has been confirmed!</p>
      
      <div class="detail-row">
        <span class="label">📅 Date:</span> ${bookingDetails.scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      
      <div class="detail-row">
        <span class="label">⏰ Time:</span> ${bookingDetails.scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
      </div>
      
      <div class="detail-row">
        <span class="label">💪 Session Type:</span> ${bookingDetails.sessionType}
      </div>
      
      <div class="detail-row">
        <span class="label">⌛ Duration:</span> ${bookingDetails.duration} minutes
      </div>
      
      ${bookingDetails.location ? `
      <div class="detail-row">
        <span class="label">📍 Location:</span> ${bookingDetails.location}
      </div>
      ` : ''}
      
      ${bookingDetails.notes ? `
      <div class="detail-row">
        <span class="label">📝 Notes:</span> ${bookingDetails.notes}
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">
        <strong>What to bring:</strong><br>
        • Water bottle<br>
        • Comfortable workout clothes<br>
        • Positive attitude!
      </p>
      
      <p>
        <strong>Need to reschedule?</strong><br>
        Please contact your trainer at <a href="mailto:${trainerEmail}">${trainerEmail}</a> at least 24 hours in advance.
      </p>
      
      <div class="footer">
        <p>This session was booked through <strong>GoodRunss</strong></p>
        <p>Train Smarter • Train Safer • Train Better</p>
      </div>
    </div>
  </div>
</body>
</html>
    `.trim()
    
    const encodedMessage = createMessage(
      clientEmail,
      trainerEmail,
      subject,
      body
    )
    
    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    
    return {
      success: true,
      messageId: response.data.id,
    }
  } catch (error: any) {
    console.error('Error sending booking confirmation email:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send session reminder email to client
 */
export async function sendSessionReminder(
  accessToken: string,
  trainerEmail: string,
  trainerName: string,
  clientEmail: string,
  clientName: string,
  sessionDetails: {
    sessionType: string
    scheduledAt: Date
    duration: number
    location?: string
  }
) {
  try {
    const auth = getOAuth2Client(accessToken)
    
    const subject = `Reminder: Training Session Tomorrow with ${trainerName}`
    
    const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .reminder-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .detail { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Session Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>
      
      <div class="reminder-box">
        <strong>Your training session is coming up!</strong>
      </div>
      
      <div class="detail">
        <strong>Trainer:</strong> ${trainerName}
      </div>
      <div class="detail">
        <strong>When:</strong> ${sessionDetails.scheduledAt.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
      </div>
      <div class="detail">
        <strong>Duration:</strong> ${sessionDetails.duration} minutes
      </div>
      ${sessionDetails.location ? `
      <div class="detail">
        <strong>Location:</strong> ${sessionDetails.location}
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">
        <strong>Quick Tips:</strong>
      </p>
      <ul>
        <li>Stay hydrated - start drinking water now!</li>
        <li>Get a good night's sleep</li>
        <li>Eat a light meal 2-3 hours before</li>
        <li>Arrive 5-10 minutes early</li>
      </ul>
      
      <p>See you soon! 💪</p>
      
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Questions? Reply to this email or contact ${trainerName} at ${trainerEmail}
      </p>
    </div>
  </div>
</body>
</html>
    `.trim()
    
    const encodedMessage = createMessage(
      clientEmail,
      trainerEmail,
      subject,
      body
    )
    
    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    
    return {
      success: true,
      messageId: response.data.id,
    }
  } catch (error: any) {
    console.error('Error sending session reminder:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send cancellation notice to client
 */
export async function sendCancellationNotice(
  accessToken: string,
  trainerEmail: string,
  trainerName: string,
  clientEmail: string,
  clientName: string,
  sessionDetails: {
    sessionType: string
    scheduledAt: Date
    reason?: string
  }
) {
  try {
    const auth = getOAuth2Client(accessToken)
    
    const subject = `Session Cancelled - ${sessionDetails.scheduledAt.toLocaleDateString()}`
    
    const body = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Session Cancelled</h1>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>
      
      <p>Your training session scheduled for <strong>${sessionDetails.scheduledAt.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</strong> has been cancelled.</p>
      
      ${sessionDetails.reason ? `
      <p><strong>Reason:</strong> ${sessionDetails.reason}</p>
      ` : ''}
      
      <p>To reschedule, please contact ${trainerName} at <a href="mailto:${trainerEmail}">${trainerEmail}</a></p>
      
      <p>We apologize for any inconvenience.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
    
    const encodedMessage = createMessage(
      clientEmail,
      trainerEmail,
      subject,
      body
    )
    
    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    
    return {
      success: true,
      messageId: response.data.id,
    }
  } catch (error: any) {
    console.error('Error sending cancellation notice:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Send generic email (for custom messages)
 */
export async function sendEmail(
  accessToken: string,
  from: string,
  to: string,
  subject: string,
  htmlBody: string
) {
  try {
    const auth = getOAuth2Client(accessToken)
    
    const encodedMessage = createMessage(to, from, subject, htmlBody)
    
    const response = await gmail.users.messages.send({
      auth,
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    })
    
    return {
      success: true,
      messageId: response.data.id,
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}




