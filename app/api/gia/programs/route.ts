import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const sport = searchParams.get('sport')

    // Build query
    const where: any = {
      instructorId: dbUser.id
    }

    if (type) where.type = type
    if (sport) where.sportCategory = sport

    // Get programs
    const programs = await prisma.gia_programs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({
      success: true,
      programs: programs.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.type,
        sportCategory: p.sportCategory,
        difficultyLevel: p.difficultyLevel,
        durationMinutes: p.durationMinutes,
        content: p.content,
        createdAt: p.createdAt,
        isFavorite: p.isFavorite,
        timesUsed: p.timesUsed,
      }))
    })

  } catch (error: any) {
    console.error('[GIA Programs] Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch programs',
      details: error.message
    }, { status: 500 })
  }
}

