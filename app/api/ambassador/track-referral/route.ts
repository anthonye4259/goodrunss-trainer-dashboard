import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Track referral when a user signs up with a referral code
 * This should be called during the signup process
 */
export async function POST(req: NextRequest) {
    try {
        const { referralCode, userId } = await req.json()

        if (!referralCode || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Find the ambassador
        const ambassador = await prisma.ambassadors.findUnique({
            where: { referralCode }
        })

        if (!ambassador) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
        }

        // Check if referral already exists
        const existingReferral = await prisma.referrals.findUnique({
            where: { referredUserId: userId }
        })

        if (existingReferral) {
            return NextResponse.json({ message: "Referral already tracked" })
        }

        // Create referral record
        const referral = await prisma.referrals.create({
            data: {
                ambassadorId: ambassador.id,
                referredUserId: userId,
                referralCode,
                status: "PENDING"
            }
        })

        // Update ambassador stats
        await prisma.ambassadors.update({
            where: { id: ambassador.id },
            data: {
                totalReferrals: { increment: 1 }
            }
        })

        return NextResponse.json({
            success: true,
            referralId: referral.id
        })
    } catch (error) {
        console.error("Error tracking referral:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
