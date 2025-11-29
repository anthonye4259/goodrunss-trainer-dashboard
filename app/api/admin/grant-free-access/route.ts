import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      )
    }

    console.log(`[GRANT FREE ACCESS] Granting free access to: ${userEmail}`)

    // Check if user already has a free subscription
    const existingFreeSub = await prisma.user_subscriptions.findFirst({
      where: {
        userId,
        planName: {
          contains: 'Free',
        },
      },
    })

    if (existingFreeSub) {
      return NextResponse.json(
        { error: "User already has free access" },
        { status: 400 }
      )
    }

    // Cancel any existing subscriptions
    await prisma.user_subscriptions.updateMany({
      where: { userId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Create lifetime free subscription
    const freeSubscription = await prisma.user_subscriptions.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        userEmail,
        planId: 'free-lifetime',
        planName: 'Lifetime Free Access - VIP',
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        status: 'active',
        billingCycle: 'lifetime',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date('2099-12-31'),
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null,
        metadata: {
          freeAccount: true,
          grantedBy: 'admin',
          grantedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log(`[GRANT FREE ACCESS] Free subscription created: ${freeSubscription.id}`)

    return NextResponse.json({
      success: true,
      message: `Free access granted to ${userEmail}`,
      subscription: freeSubscription,
    })
  } catch (error: any) {
    console.error("[GRANT FREE ACCESS] Error:", error)
    return NextResponse.json(
      {
        error: "Failed to grant free access",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

