import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/workouts - Get all workout plans
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      clientId,
      name,
      description,
      goal,
      duration,
      difficulty,
      clientGoals,
      fitnessLevel,
      availableTime,
      sessionsPerWeek,
      equipment,
      injuries,
      preferences,
      generatedBy,
      aiModel,
      startDate,
      endDate,
      isTemplate,
      autoAdjust,
    } = body

    if (!clientId || !name || !goal || !duration || !difficulty || !fitnessLevel || !availableTime || !sessionsPerWeek) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const totalSessions = duration * sessionsPerWeek

    const workoutPlan = await prisma.workoutPlan.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId,
        name,
        description: description || null,
        goal,
        duration,
        difficulty,
        clientGoals: clientGoals || {},
        fitnessLevel,
        availableTime,
        sessionsPerWeek,
        equipment: equipment || [],
        injuries: injuries || [],
        preferences: preferences || null,
        generatedBy: generatedBy || 'trainer',
        aiModel: aiModel || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isTemplate: isTemplate || false,
        autoAdjust: autoAdjust !== undefined ? autoAdjust : true,
        totalSessions,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      workoutPlan,
    })
  } catch (error) {
    console.error('Error creating workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to create workout plan' },
      { status: 500 }
    )
  }
}


