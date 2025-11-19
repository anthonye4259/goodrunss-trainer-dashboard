import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/exercises - Get all exercises (with filters)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const equipment = searchParams.get('equipment')
    const search = searchParams.get('search')

    const where: any = {}

    if (category) where.category = category
    if (difficulty) where.difficulty = difficulty
    if (equipment) where.equipment = { has: equipment }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { popularityScore: 'desc' },
    })

    return NextResponse.json({
      success: true,
      exercises,
      total: exercises.length,
    })
  } catch (error) {
    console.error('Error fetching exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

// POST /api/exercises - Create new exercise
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    if (!name || !description || !category || !difficulty || !instructions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        category,
        muscleGroups: muscleGroups || [],
        equipment: equipment || [],
        difficulty,
        instructions,
        tips: tips || null,
        videoUrl: videoUrl || null,
        imageUrl: imageUrl || null,
        caloriesPerMinute: caloriesPerMinute || null,
        contraindications: contraindications || [],
        substitutes: substitutes || [],
      },
    })

    return NextResponse.json({
      success: true,
      exercise,
    })
  } catch (error) {
    console.error('Error creating exercise:', error)
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    )
  }
}


