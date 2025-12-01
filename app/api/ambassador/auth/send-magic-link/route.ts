import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      console.error("[MAGIC_LINK] No email provided")
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(`[MAGIC_LINK] Request for email: ${email}`)

    // Find ambassador by email
    const ambassador = await prisma.ambassadors.findUnique({
      where: { email }
    })

    if (!ambassador) {
      console.error(`[MAGIC_LINK] Ambassador not found for email: ${email}`)
      return NextResponse.json({ error: "Ambassador not found. Please sign up first." }, { status: 404 })
    }

    console.log(`[MAGIC_LINK] Found ambassador: ${ambassador.id}`)

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save magic link
    await prisma.ambassador_magic_links.create({
      data: {
        ambassadorId: ambassador.id,
        token,
        expiresAt
      }
    })

    console.log(`[MAGIC_LINK] Created magic link token for ${email}`)

    // Create magic link URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://goodrunss-trainer-dashboard.vercel.app"
    const magicLink = `${appUrl}/ambassador/verify?token=${token}`

    // Always log the magic link for debugging
    console.log(`[MAGIC_LINK] Login link for ${email}: ${magicLink}`)

    // Check if Resend API key is configured
    const hasResendKey = process.env.RESEND_API_KEY &&
      process.env.RESEND_API_KEY !== "your_resend_api_key_here" &&
      process.env.RESEND_API_KEY.startsWith("re_")

    if (!hasResendKey) {
      console.warn("[MAGIC_LINK] RESEND_API_KEY not configured - email will not be sent")
      console.warn("[MAGIC_LINK] Use this link to login:", magicLink)
      return NextResponse.json({
        success: true,
        message: "Magic link generated! (Email sending not configured - check server logs for link)",
        devLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
      })
    }

    // Send email via Resend
    try {
      console.log(`[MAGIC_LINK] Attempting to send email to ${email}`)

      const result = await resend.emails.send({
        from: "GoodRunss Ambassadors <helpdesk@teamgoodrunss.com>",
        to: email,
        subject: "🔐 Your Ambassador Dashboard Login Link",
        html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                  .header { text-align: center; margin-bottom: 40px; }
                  h1 { color: #8b5cf6; margin: 0 0 10px; font-size: 28px; }
                  .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                  .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome back! 👋</h1>
                    <p>Click the button below to access your ambassador dashboard:</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="${magicLink}" class="button">
                      Access Dashboard →
                    </a>
                  </div>

                  <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                    This link expires in 15 minutes.<br/>
                    If you didn't request this, ignore this email.
                  </p>

                  <div class="footer">
                    <p><strong>The GoodRunss Team</strong></p>
                    <p style="font-size: 12px; color: #999;">
                      Questions? Email us at <a href="mailto:anthony@goodrunss.com">anthony@goodrunss.com</a>
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `
      })

      console.log(`[MAGIC_LINK] Email sent successfully:`, result)

      return NextResponse.json({
        success: true,
        message: "Magic link sent! Check your email."
      })

    } catch (emailError: any) {
      console.error("[MAGIC_LINK] Failed to send email:", {
        error: emailError?.message,
        name: emailError?.name,
        statusCode: emailError?.statusCode,
        response: emailError?.response
      })

      // Return error with helpful message
      return NextResponse.json({
        error: "Failed to send email. Please try again or contact support.",
        details: process.env.NODE_ENV === 'development' ? emailError?.message : undefined,
        magicLink: process.env.NODE_ENV === 'development' ? magicLink : undefined
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("[MAGIC_LINK_ERROR]", {
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json({
      error: "Failed to send magic link",
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 })
  }
}
