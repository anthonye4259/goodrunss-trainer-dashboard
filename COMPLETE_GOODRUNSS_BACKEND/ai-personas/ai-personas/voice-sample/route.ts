import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Public API: Get AI Persona Voice Sample
 * Returns voice sample text and ElevenLabs voice ID for playback
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const personaId = searchParams.get('personaId')

    if (!personaId) {
      return NextResponse.json(
        { error: 'personaId is required' },
        { status: 400 }
      )
    }

    const persona = await prisma.aiPersona.findUnique({
      where: { id: personaId },
      select: {
        id: true,
        name: true,
        voiceFileUrl: true,
        voiceSampleText: true,
        elevenLabsVoiceId: true,
        isActive: true,
        isDiscoverable: true,
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

    return NextResponse.json({
      success: true,
      voiceSample: {
        text: persona.voiceSampleText || `Hello! I'm ${persona.name}, your AI training assistant. I'm here to help you achieve your fitness goals with personalized guidance and motivation. Let's get started!`,
        voiceId: persona.elevenLabsVoiceId,
        audioUrl: persona.voiceFileUrl,
      }
    })
  } catch (error) {
    console.error('Error fetching voice sample:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voice sample' },
      { status: 500 }
    )
  }
}

