import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/send-email'
import { getOrCreateUser } from '@/lib/get-or-create-user'

// Test endpoint to verify email service is working
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to } = await request.json()
    const testEmail = to || trainer.email

    if (!testEmail) {
      return NextResponse.json({ 
        error: 'No email address provided and trainer has no email' 
      }, { status: 400 })
    }

    const result = await sendEmail({
      to: testEmail,
      subject: '✅ GoodRunss Email Test',
      html: `
        <h2>Email Service Working! ✅</h2>
        <p>This is a test email from your GoodRunss Trainer Dashboard.</p>
        <p>If you're reading this, your email service is configured correctly!</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        <p><strong>Resend Status:</strong> ${process.env.RESEND_API_KEY ? 'Configured ✅' : 'Not configured ⚠️'}</p>
      `,
      text: `Email service test from GoodRunss. Time: ${new Date().toLocaleString()}`
    })

    return NextResponse.json({
      success: true,
      message: 'Test email sent',
      to: testEmail,
      result,
      environment: {
        resendConfigured: !!process.env.RESEND_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    console.error('Test email error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
}

