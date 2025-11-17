/**
 * ChatGPT Action: Generate Session Plan
 * Allows ChatGPT to generate training session plans via Gia
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key')
    
    if (!apiKey || apiKey !== process.env.GPT_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clientName, clientAge, clientLevel, sport, trainerId } = body

    // Validate required fields
    if (!clientName || !clientLevel || !sport || !trainerId) {
      return NextResponse.json(
        { error: 'Missing required fields: clientName, clientLevel, sport, trainerId' },
        { status: 400 }
      )
    }

    // Call the actual session plan generator
    const response = await fetch(`${request.nextUrl.origin}/api/gia/generate-session-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientName,
        clientAge,
        clientLevel,
        sport,
        trainerId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Return simplified response for ChatGPT
    return NextResponse.json({
      success: true,
      message: `Created session plan for ${clientName}`,
      plan: {
        warmup: data.data.warmup,
        drills: data.data.drills,
        cooldown: data.data.cooldown,
        duration: data.data.duration,
        notes: data.data.notes,
        instagramPost: data.data.instagramContent?.caption,
        messageToClient: data.data.messageToClient,
      },
      generationTime: data.generationTime,
    })
  } catch (error) {
    console.error('ChatGPT API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate session plan' },
      { status: 500 }
    )
  }
}

