import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Generate a unique referral code
function generateReferralCode(name: string): string {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
    const namePrefix = name?.substring(0, 3).toUpperCase() || "AMB"
    return `${namePrefix}${randomString}`
}

export async function POST(req: NextRequest) {
    try {
        // Parse request body
        let body
        try {
            body = await req.json()
        } catch (parseError) {
            console.error("[Ambassador Join] Failed to parse request body:", parseError)
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            )
        }

        const { name, email, payoutEmail } = body

        // Validate required fields
        if (!name || !email || !payoutEmail) {
            console.error("[Ambassador Join] Missing required fields:", { name: !!name, email: !!email, payoutEmail: !!payoutEmail })
            return NextResponse.json(
                { error: "Name, email, and payout email are required" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email) || !emailRegex.test(payoutEmail)) {
            console.error("[Ambassador Join] Invalid email format:", { email, payoutEmail })
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        console.log("[Ambassador Join] Checking for existing ambassador with email:", email)

        // Check if email already exists
        const existing = await prisma.ambassadors.findUnique({
            where: { email }
        })

        if (existing) {
            console.log("[Ambassador Join] Ambassador already exists:", existing.id)
            return NextResponse.json(
                { error: "An ambassador with this email already exists" },
                { status: 400 }
            )
        }

        // Create ambassador record
        const referralCode = generateReferralCode(name)
        console.log("[Ambassador Join] Creating ambassador with referral code:", referralCode)

        const ambassador = await prisma.ambassadors.create({
            data: {
                email,
                name,
                referralCode,
                payoutMethod: "PAYPAL",
                payoutEmail,
                isActive: true
            }
        })

        console.log("[Ambassador Join] Successfully created ambassador:", ambassador.id)

        // TODO: Send welcome email with referral link
        // You can integrate with SendGrid, Resend, or your email service here

        return NextResponse.json({
            success: true,
            referralCode: ambassador.referralCode,
            referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://goodrunss-trainer-dashboard.vercel.app"}/signup?ref=${ambassador.referralCode}`,
            message: "Welcome to the Ambassador Program!"
        })
    } catch (error: any) {
        console.error("[Ambassador Join] Error creating ambassador:", {
            message: error?.message,
            code: error?.code,
            meta: error?.meta,
            stack: error?.stack
        })

        // Return specific error message for debugging
        const errorMessage = error?.message || "Internal server error"
        const errorCode = error?.code || "UNKNOWN_ERROR"

        return NextResponse.json(
            {
                error: `Failed to create ambassador: ${errorMessage}`,
                code: errorCode,
                details: process.env.NODE_ENV === 'development' ? error?.meta : undefined
            },
            { status: 500 }
        )
    }
}
