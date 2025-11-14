import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Start AI Persona Training Session
 * Creates a new session record
 */
export async function POST(req: NextRequest) {
  try {
    const { personaId, userId } = await req.json()

    if (!personaId || !userId) {
      return NextResponse.json(
        { error: 'personaId and userId are required' },
        { status: 400 }
      )
    }

    // Validate persona
    const persona = await prisma.aiPersona.findUnique({
      where: { id: personaId },
      select: {
        id: true,
        trainerId: true,
        name: true,
        isActive: true,
        pricePerSession: true,
      }
    })

    if (!persona || !persona.isActive) {
      return NextResponse.json(
        { error: 'AI persona not available' },
        { status: 404 }
      )
    }

    // Create session
    const session = await prisma.aiPersonaSession.create({
      data: {
        personaId: personaId,
        playerId: userId,
        duration: 0,
        messageCount: 0,
        cost: persona.pricePerSession,
        trainerEarnings: persona.pricePerSession,
        paymentStatus: 'pending',
        startedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        personaId: session.personaId,
        playerId: session.playerId,
        startedAt: session.startedAt,
        cost: Number(session.cost),
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Error starting AI persona session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

