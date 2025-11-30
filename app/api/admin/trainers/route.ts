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
        name: true,
        email: true,
        createdAt: true,
        isAvailable: true,
      },
    })

    // Get subscriptions for each trainer
    const trainersWithSubscriptions = await Promise.all(
      trainers.map(async (trainer) => {
        if (!trainer.id) {
          return {
            ...trainer,
            subscription: null,
          }
        }

        const trainerId = trainer.id

        const subscription = await prisma.userSubscription.findFirst({
          where: { userId: trainerId },
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
