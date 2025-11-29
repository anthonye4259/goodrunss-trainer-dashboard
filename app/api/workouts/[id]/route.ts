import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/workouts/[id] - Get single workout plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const workoutPlan = await prisma.workout_plans.findUnique({
      where: { id },
      include: {
        workout_sessions: {
          orderBy: { scheduledFor: 'asc' },
        },
      },
    })

    if (!workoutPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    if (workoutPlan.trainerId !== trainer.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      workoutPlan,
    })
  } catch (error) {
    console.error('Error fetching workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout plan' },
      { status: 500 }
    )
  }
}

// PUT /api/workouts/[id] - Update workout plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    const {
      name,
      description,
      goal,
      duration,
      difficulty,
      status,
      currentWeek,
      startDate,
      endDate,
      autoAdjust,
    } = body

    // Verify ownership
    const existingPlan = await prisma.workout_plans.findUnique({
      where: { id },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    if (existingPlan.trainerId !== trainer.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const workoutPlan = await prisma.workout_plans.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(goal && { goal }),
        ...(duration && { duration }),
        ...(difficulty && { difficulty }),
        ...(status && { status }),
        ...(currentWeek && { currentWeek }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(autoAdjust !== undefined && { autoAdjust }),
      },
    })

    return NextResponse.json({
      success: true,
      workoutPlan,
    })
  } catch (error) {
    console.error('Error updating workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to update workout plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/workouts/[id] - Delete workout plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existingPlan = await prisma.workout_plans.findUnique({
      where: { id },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Workout plan not found' }, { status: 404 })
    }

    if (existingPlan.trainerId !== trainer.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.workout_plans.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Workout plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting workout plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout plan' },
      { status: 500 }
    )
  }
}
