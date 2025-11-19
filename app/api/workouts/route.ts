import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/workouts - Get all workout plans
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer from database
    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')

    const where: any = { trainerId: trainer.id }
    if (clientId) where.clientId = clientId
    if (status) where.status = status

    const workoutPlans = await prisma.workout_plans.findMany({
      where,
      include: {
        workouts: {
          take: 5,
          orderBy: { scheduledFor: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      workoutPlans,
      total: workoutPlans.length,
    })
  } catch (error) {
    console.error('Error fetching workout plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout plans' },
      { status: 500 }
    )
  }
}

// POST /api/workouts - Create new workout plan
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get trainer from database
    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
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

    const workoutPlan = await prisma.workout_plans.create({
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


