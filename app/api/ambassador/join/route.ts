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
        const { name, email, payoutEmail } = await req.json()

        if (!name || !email || !payoutEmail) {
            return NextResponse.json(
                { error: "Name, email, and payout email are required" },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existing = await prisma.ambassadors.findUnique({
            where: { email }
        })

        if (existing) {
            return NextResponse.json(
                { error: "An ambassador with this email already exists" },
                { status: 400 }
            )
        }

        // Create ambassador record
        const referralCode = generateReferralCode(name)

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

        // TODO: Send welcome email with referral link
        // You can integrate with SendGrid, Resend, or your email service here

        return NextResponse.json({
            success: true,
            referralCode: ambassador.referralCode,
            referralLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://goodrunss-trainer-dashboard.vercel.app"}/signup?ref=${ambassador.referralCode}`,
            message: "Welcome to the Ambassador Program!"
        })
    } catch (error) {
        console.error("Error creating ambassador:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
