import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MINIMUM_PAYOUT = 50 // $50 USD minimum

export async function POST(request: Request) {
    try {
        const { ambassadorId, email } = await request.json()

        // Find ambassador by ID or email
        const ambassador = ambassadorId
            ? await prisma.ambassadors.findUnique({ where: { id: ambassadorId } })
            : await prisma.ambassadors.findUnique({ where: { email } })

        if (!ambassador) {
            return NextResponse.json({ error: "Ambassador not found" }, { status: 404 })
        }

        // Check if there's already a pending request
        const existingRequest = await prisma.payout_requests.findFirst({
            where: {
                ambassadorId: ambassador.id,
                status: { in: ["PENDING", "APPROVED", "PROCESSING"] }
            }
        })

        if (existingRequest) {
            return NextResponse.json(
                { error: "You already have a pending payout request" },
                { status: 400 }
            )
        }

        // Check minimum balance
        const availableBalance = Number(ambassador.pendingEarnings)
        if (availableBalance < MINIMUM_PAYOUT) {
            return NextResponse.json(
                { error: `Minimum payout amount is $${MINIMUM_PAYOUT}` },
                { status: 400 }
            )
        }

        // Create payout request
        const payoutRequest = await prisma.payout_requests.create({
            data: {
                ambassadorId: ambassador.id,
                amount: ambassador.pendingEarnings,
                currency: ambassador.currency,
                payoutEmail: ambassador.payoutEmail || ambassador.email || "",
                payoutMethod: ambassador.payoutMethod || "STRIPE",
                status: "PENDING"
            }
        })

        // TODO: Send email notification
        // await sendEmail({
        //   to: ambassador.email || ambassador.payoutEmail,
        //   subject: "Payout Request Received",
        //   template: "payout-requested",
        //   data: { amount: payoutRequest.amount, currency: payoutRequest.currency }
        // })

        return NextResponse.json({
            success: true,
            payoutRequest: {
                id: payoutRequest.id,
                amount: payoutRequest.amount,
                currency: payoutRequest.currency,
                status: payoutRequest.status,
                requestedAt: payoutRequest.requestedAt
            }
        })
    } catch (error) {
        console.error("[PAYOUT_REQUEST_ERROR]", error)
        return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 })
    }
}

// GET - Fetch payout requests for an ambassador
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const ambassadorId = searchParams.get("ambassadorId")
        const email = searchParams.get("email")

        if (!ambassadorId && !email) {
            return NextResponse.json({ error: "Ambassador ID or email required" }, { status: 400 })
        }

        // Find ambassador
        const ambassador = ambassadorId
            ? await prisma.ambassadors.findUnique({ where: { id: ambassadorId } })
            : await prisma.ambassadors.findUnique({ where: { email: email! } })

        if (!ambassador) {
            return NextResponse.json({ error: "Ambassador not found" }, { status: 404 })
        }

        // Fetch payout requests
        const payoutRequests = await prisma.payout_requests.findMany({
            where: { ambassadorId: ambassador.id },
            orderBy: { requestedAt: "desc" }
        })

        return NextResponse.json({ payoutRequests })
    } catch (error) {
        console.error("[PAYOUT_REQUESTS_GET_ERROR]", error)
        return NextResponse.json({ error: "Failed to fetch payout requests" }, { status: 500 })
    }
}
