import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get all trainers with their subscriptions
    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clerkId: true,
        name: true,
        email: true,
        createdAt: true,
        isAvailable: true,
      },
    })

    // Get subscriptions for each trainer
    const trainersWithSubscriptions = await Promise.all(
      trainers.map(async (trainer) => {
        if (!trainer.clerkId) {
          return {
            ...trainer,
            subscription: null,
          }
        }

        // Store clerkId in a variable for TypeScript type narrowing
        const clerkId = trainer.clerkId

        const subscription = await prisma.user_subscriptions.findFirst({
          where: { userId: clerkId },
          orderBy: { createdAt: 'desc' },
        })

        return {
          ...trainer,
          subscription: subscription
            ? {
                planName: subscription.planName,
                status: subscription.status,
                currentPeriodEnd: subscription.currentPeriodEnd,
              }
            : null,
        }
      })
    )

    return NextResponse.json({
      success: true,
      trainers: trainersWithSubscriptions,
    })
  } catch (error) {
    console.error('Error fetching trainers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trainers' },
      { status: 500 }
    )
  }
}

