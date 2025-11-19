import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET /api/exercises/[id] - Get single exercise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const exercise = await prisma.exercises.findUnique({
      where: { id },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      exercise,
    })
  } catch (error) {
    console.error('Error fetching exercise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    )
  }
}

// PUT /api/exercises/[id] - Update exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      category,
      muscleGroups,
      equipment,
      difficulty,
      instructions,
      tips,
      videoUrl,
      imageUrl,
      caloriesPerMinute,
      contraindications,
      substitutes,
    } = body

    const exercise = await prisma.exercises.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(muscleGroups && { muscleGroups }),
        ...(equipment && { equipment }),
        ...(difficulty && { difficulty }),
        ...(instructions && { instructions }),
        ...(tips !== undefined && { tips }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(caloriesPerMinute !== undefined && { caloriesPerMinute }),
        ...(contraindications && { contraindications }),
        ...(substitutes && { substitutes }),
      },
    })

    return NextResponse.json({
      success: true,
      exercise,
    })
  } catch (error) {
    console.error('Error updating exercise:', error)
    return NextResponse.json(
      { error: 'Failed to update exercise' },
      { status: 500 }
    )
  }
}

// DELETE /api/exercises/[id] - Delete exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.exercises.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Exercise deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting exercise:', error)
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    )
  }
}


