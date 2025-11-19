import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
})

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id" },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    // Create session in database
    try {
      const metadata = session.metadata
      
      if (metadata) {
        // Create the training session in the database
        await prisma.trainer_sessions.create({
          data: {
            id: crypto.randomUUID(),
            trainerId: metadata.trainerId,
            clientId: null, // Client doesn't have account yet
            title: metadata.serviceName || "Training Session",
            description: `Booked by ${metadata.clientName || metadata.clientEmail}`,
            type: "ONE_ON_ONE",
            duration: 60,
            scheduledAt: new Date(`${metadata.date} ${metadata.time}`),
            status: "SCHEDULED",
            bookedFrom: "BOOKING_LINK",
            updatedAt: new Date(),
          },
        })
      }
    } catch (dbError) {
      console.error("Error creating session in database:", dbError)
      // Don't fail the request even if DB save fails
    }

    return NextResponse.json({
      success: true,
      date: session.metadata?.date,
      time: session.metadata?.time,
      serviceName: session.metadata?.serviceName,
      clientEmail: session.metadata?.clientEmail,
      clientName: session.metadata?.clientName,
      amountPaid: session.amount_total ? session.amount_total / 100 : 0,
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    )
  }
}

