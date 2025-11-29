import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Find ambassador by email
        const ambassador = await prisma.ambassadors.findUnique({
            where: { email }
        })

        if (!ambassador) {
            return NextResponse.json({ error: "Ambassador not found. Please sign up first." }, { status: 404 })
        }

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

        // Create magic link URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        const magicLink = `${appUrl}/ambassador/verify?token=${token}`

        // Send email via Resend
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "your_resend_api_key_here") {
            try {
                await resend.emails.send({
                    from: "GoodRunss Ambassadors <ambassadors@goodrunss.com>",
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
            } catch (emailError) {
                console.error("[MAGIC_LINK] Failed to send email:", emailError)
                // Continue anyway - we'll log the link for development
            }
        }

        // For development: log the magic link
        console.log(`[MAGIC_LINK] Login link for ${email}: ${magicLink}`)

        return NextResponse.json({
            success: true,
            message: "Magic link sent! Check your email."
        })

    } catch (error) {
        console.error("[MAGIC_LINK_ERROR]", error)
        return NextResponse.json({ error: "Failed to send magic link" }, { status: 500 })
    }
}
