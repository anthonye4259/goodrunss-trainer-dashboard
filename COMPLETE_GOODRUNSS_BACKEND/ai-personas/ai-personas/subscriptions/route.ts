import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Get User's AI Persona Subscriptions
 * Used by consumer app to manage subscriptions
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get all sessions for this user (represents "subscriptions" in pay-per-use model)
    const sessions = await prisma.aiPersonaSession.findMany({
      where: {
        playerId: userId,
        paymentStatus: 'completed', // Only paid sessions
      },
      include: {
        persona: {
          select: {
            id: true,
            trainerId: true,
            name: true,
            avatarUrl: true,
            teachingStyle: true,
            specialties: true,
            pricePerSession: true,
            averageRating: true,
            totalRatings: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by persona to create subscription-like objects
    const subscriptionMap = new Map()

    for (const session of sessions) {
      if (!session.persona) continue

      const personaId = session.personaId

      if (!subscriptionMap.has(personaId)) {
        // Get trainer info
        const trainer = await prisma.user.findUnique({
          where: { id: session.persona.trainerId },
          select: {
            name: true,
            image: true,
          }
        })

        subscriptionMap.set(personaId, {
          id: `sub_${personaId}_${userId}`,
          userId: userId,
          personaId: personaId,
          trainerId: session.persona.trainerId,
          status: 'active', // Always active for pay-per-use
          model: 'pay_per_use',
          sessionsRemaining: null, // Unlimited in pay-per-use
          totalSpent: 0,
          sessionCount: 0,
          lastSessionAt: session.createdAt,
          createdAt: session.createdAt,
          persona: {
            id: session.persona.id,
            personaName: session.persona.name,
            trainerName: trainer?.name || 'Unknown',
            trainerImage: trainer?.image || session.persona.avatarUrl,
            specialties: session.persona.specialties,
            averageRating: Number(session.persona.averageRating) || 0,
            reviewCount: session.persona.totalRatings || 0,
          }
        })
      }

      // Update stats
      const sub = subscriptionMap.get(personaId)
      sub.totalSpent += Number(session.cost) || 0
      sub.sessionCount += 1
      if (new Date(session.createdAt) > new Date(sub.lastSessionAt)) {
        sub.lastSessionAt = session.createdAt
      }
    }

    const subscriptions = Array.from(subscriptionMap.values())

    return NextResponse.json({
      subscriptions: subscriptions.sort((a, b) => 
        new Date(b.lastSessionAt).getTime() - new Date(a.lastSessionAt).getTime()
      )
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

