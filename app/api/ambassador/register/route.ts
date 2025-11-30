import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Generate a unique referral code
function generateReferralCode(name: string): string {
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
    const namePrefix = name?.substring(0, 3).toUpperCase() || "REF"
    return `${namePrefix}${randomString}`
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: { ambassador: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Check if already an ambassador
        if (user.ambassador) {
            return NextResponse.json({
                message: "Already an ambassador",
                referralCode: user.ambassador.referralCode
            })
        }

        // Create ambassador record
        const referralCode = generateReferralCode(user.name || user.email)

        const ambassador = await prisma.ambassadors.create({
            data: {
                userId: user.id,
                referralCode,
                isActive: true
            }
        })

        return NextResponse.json({
            success: true,
            referralCode: ambassador.referralCode,
            message: "Welcome to the Ambassador Program!"
        })
    } catch (error) {
        console.error("Error registering ambassador:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
