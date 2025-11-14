import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Subscribe to AI Persona
 * For pay-per-use model, this just validates access and returns persona info
 */
export async function POST(req: NextRequest) {
  try {
    const { personaId, userId, model } = await req.json()

    if (!personaId || !userId) {
      return NextResponse.json(
        { error: 'personaId and userId are required' },
        { status: 400 }
      )
    }

    // Validate persona exists and is active
    const persona = await prisma.aiPersona.findUnique({
      where: { id: personaId },
      select: {
        id: true,
        trainerId: true,
        name: true,
        isActive: true,
        isDiscoverable: true,
        pricePerSession: true,
      }
    })

    if (!persona) {
      return NextResponse.json(
        { error: 'AI persona not found' },
        { status: 404 }
      )
    }

    if (!persona.isActive || !persona.isDiscoverable) {
      return NextResponse.json(
        { error: 'AI persona not available' },
        { status: 403 }
      )
    }

    // For pay-per-use model, no subscription record needed
    // User pays per session when they train
    // Just return success and persona info

    return NextResponse.json({
      success: true,
      subscription: {
        id: `sub_${personaId}_${userId}`,
        personaId: personaId,
        userId: userId,
        model: model || 'pay_per_use',
        status: 'active',
        pricePerSession: Number(persona.pricePerSession) || 0.30,
        message: `You can now train with ${persona.name}! You'll be charged $${persona.pricePerSession} per session.`
      }
    })
  } catch (error) {
    console.error('Error subscribing to AI persona:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to AI persona' },
      { status: 500 }
    )
  }
}

