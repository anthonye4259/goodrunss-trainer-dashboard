import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

/**
 * Public API: End AI Persona Training Session
 * Finalizes session, processes payment, updates stats
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, rating, feedback, stripePaymentId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Get session
    const session = await prisma.aiPersonaSession.findUnique({
      where: { id: sessionId },
      include: {
        persona: {
          select: {
            id: true,
            trainerId: true,
            name: true,
            totalSessions: true,
            totalEarnings: true,
            averageRating: true,
            totalRatings: true,
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.endedAt) {
      return NextResponse.json(
        { error: 'Session already ended' },
        { status: 400 }
      )
    }

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - new Date(session.startedAt).getTime()) / 1000 / 60) // minutes

    // Update session
    const updatedSession = await prisma.aiPersonaSession.update({
      where: { id: sessionId },
      data: {
        endedAt: endTime,
        duration: duration,
        paymentStatus: stripePaymentId ? 'completed' : 'pending',
        stripePaymentId: stripePaymentId,
        paidAt: stripePaymentId ? endTime : null,
      }
    })

    // Update persona stats
    if (stripePaymentId) {
      await prisma.aiPersona.update({
        where: { id: session.personaId },
        data: {
          totalSessions: { increment: 1 },
          totalEarnings: { increment: session.cost },
        }
      })

      // Create earnings record
      await prisma.aiPersonaEarning.create({
        data: {
          personaId: session.personaId,
          trainerId: session.persona!.trainerId,
          amount: session.trainerEarnings as Decimal,
          sessionCount: 1,
          date: endTime,
          payoutStatus: 'pending',
        }
      })
    }

    // If rating provided, save feedback
    if (rating) {
      const feedbackRecord = await prisma.aiPersonaFeedback.create({
        data: {
          personaId: session.personaId,
          playerId: session.playerId,
          sessionId: sessionId,
          rating: rating,
          comment: feedback || null,
          isHelpful: rating >= 4,
          accuracyRating: rating, // Can be separate in future
        }
      })

      // Update persona average rating
      const persona = session.persona!
      const newTotalRatings = (persona.totalRatings || 0) + 1
      const currentAvg = Number(persona.averageRating) || 0
      const newAvg = ((currentAvg * (persona.totalRatings || 0)) + rating) / newTotalRatings

      await prisma.aiPersona.update({
        where: { id: session.personaId },
        data: {
          averageRating: newAvg,
          totalRatings: newTotalRatings,
        }
      })
    }

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        personaId: updatedSession.personaId,
        duration: updatedSession.duration,
        messageCount: updatedSession.messageCount,
        cost: Number(updatedSession.cost),
        paymentStatus: updatedSession.paymentStatus,
        endedAt: updatedSession.endedAt,
      }
    })
  } catch (error) {
    console.error('Error ending AI persona session:', error)
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    )
  }
}

