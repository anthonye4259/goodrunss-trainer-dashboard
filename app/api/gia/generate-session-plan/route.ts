/**
 * API Route: Generate Session Plan
 * POST /api/gia/generate-session-plan
 * 
 * Generates a complete AI session plan in under 20 seconds
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSessionPlan } from '@/lib/services/gia-session-generator'
import type { GenerateSessionPlanInput, GenerateSessionPlanResponse } from '@/lib/types/gia-session-plan'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body = await request.json()
    const { clientName, clientAge, clientLevel, sport, trainerId } = body

    // Validate required fields
    if (!clientName || !clientLevel || !sport || !trainerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: clientName, clientLevel, sport, trainerId',
        },
        { status: 400 }
      )
    }

    // Validate client level
    if (!['beginner', 'intermediate', 'advanced'].includes(clientLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: 'clientLevel must be one of: beginner, intermediate, advanced',
        },
        { status: 400 }
      )
    }

    const input: GenerateSessionPlanInput = {
      clientName,
      clientAge,
      clientLevel,
      sport,
    }

    // Generate the session plan using AI
    console.log(`🎯 Generating session plan for ${clientName} (${sport}, ${clientLevel})...`)
    const aiResult = await generateSessionPlan(input)

    // Save to database
    const sessionPlan = await prisma.giaSessionPlan.create({
      data: {
        trainerId,
        clientName,
        clientAge,
        clientLevel,
        sport,
        sessionDuration: aiResult.sessionDuration,
        warmup: aiResult.warmup as any, // Prisma Json type
        drills: aiResult.drills as any,
        cooldown: aiResult.cooldown as any,
        notes: aiResult.notes,
        progressions: aiResult.progressions,
        videoPlaylist: aiResult.videoPlaylist as any,
        instagramContent: aiResult.instagramContent as any,
        messageToClient: aiResult.messageToClient,
        aiModel: 'claude-3-5-sonnet',
        generationTime: Date.now() - startTime,
        status: 'generated',
      },
    })

    const endTime = Date.now()
    const totalTime = endTime - startTime

    console.log(`✅ Session plan created in ${totalTime}ms (ID: ${sessionPlan.id})`)

    // Format response
    const response: GenerateSessionPlanResponse = {
      success: true,
      data: {
        ...sessionPlan,
        clientAge: sessionPlan.clientAge ?? undefined,
        clientLevel: sessionPlan.clientLevel as "beginner" | "intermediate" | "advanced",
        notes: sessionPlan.notes ?? undefined,
        warmup: sessionPlan.warmup as any,
        drills: sessionPlan.drills as any,
        cooldown: sessionPlan.cooldown as any,
        videoPlaylist: sessionPlan.videoPlaylist as any,
        instagramContent: sessionPlan.instagramContent as any,
      },
      generationTime: totalTime,
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'X-Generation-Time': `${totalTime}ms`,
      },
    })
  } catch (error) {
    console.error('❌ Error generating session plan:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate session plan'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        generationTime: Date.now() - startTime,
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to retrieve a session plan by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const trainerId = searchParams.get('trainerId')

    if (id) {
      // Get specific session plan
      const sessionPlan = await prisma.giaSessionPlan.findUnique({
        where: { id },
      })

      if (!sessionPlan) {
        return NextResponse.json(
          { success: false, error: 'Session plan not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...sessionPlan,
          warmup: sessionPlan.warmup as any,
          drills: sessionPlan.drills as any,
          cooldown: sessionPlan.cooldown as any,
          videoPlaylist: sessionPlan.videoPlaylist as any,
          instagramContent: sessionPlan.instagramContent as any,
        },
      })
    } else if (trainerId) {
      // Get all session plans for a trainer
      const sessionPlans = await prisma.giaSessionPlan.findMany({
        where: { trainerId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return NextResponse.json({
        success: true,
        data: sessionPlans.map((plan) => ({
          ...plan,
          warmup: plan.warmup as any,
          drills: plan.drills as any,
          cooldown: plan.cooldown as any,
          videoPlaylist: plan.videoPlaylist as any,
          instagramContent: plan.instagramContent as any,
        })),
        total: sessionPlans.length,
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing id or trainerId parameter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching session plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session plan' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

