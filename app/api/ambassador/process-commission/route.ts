import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-10-29.clover"
})

/**
 * Process commissions when a payment is received
 * This should be called from the Stripe webhook handler
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, amount, isFirstPayment } = await req.json()

        if (!userId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Check if this user was referred
        const referral = await prisma.referralTracking.findUnique({
            where: { referredUserId: userId },
            include: { ambassador: true }
        })

        if (!referral) {
            return NextResponse.json({ message: "No referral found" })
        }

        // Calculate commission based on payment type
        const commissionRate = isFirstPayment ? 0.5 : 0.1 // 50% first month, 10% recurring
        const commissionAmount = amount * commissionRate
        const commissionType = isFirstPayment ? "FIRST_MONTH" : "RECURRING"

        // Create commission record
        const commission = await prisma.commissions.create({
            data: {
                ambassadorId: referral.ambassadorId,
                referralId: referral.id,
                amount: commissionAmount,
                type: commissionType,
                status: "PENDING"
            }
        })

        // Update ambassador earnings
        await prisma.ambassadors.update({
            where: { id: referral.ambassadorId },
            data: {
                totalEarnings: { increment: commissionAmount },
                pendingEarnings: { increment: commissionAmount }
            }
        })

        // Update referral status on first payment
        if (isFirstPayment && referral.status === "PENDING") {
            await prisma.referralTracking.update({
                where: { id: referral.id },
                data: {
                    status: "CONVERTED",
                    convertedAt: new Date(),
                    firstPaymentAt: new Date()
                }
            })

            // Update active referrals count
            await prisma.ambassadors.update({
                where: { id: referral.ambassadorId },
                data: {
                    activeReferrals: { increment: 1 }
                }
            })
        }

        // Update referral status to ACTIVE if not already
        if (referral.status === "CONVERTED") {
            await prisma.referralTracking.update({
                where: { id: referral.id },
                data: { status: "ACTIVE" }
            })
        }

        return NextResponse.json({
            success: true,
            commissionId: commission.id,
            amount: commissionAmount
        })
    } catch (error) {
        console.error("Error processing commission:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
