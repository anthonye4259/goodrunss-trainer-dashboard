import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from User model (TrainerProfile model doesn't exist)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        specialties: true,
        certifications: true,
        hourlyRate: true,
        phone: true,
        location: true,
        image: true,
      }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: dbUser
    })
  } catch (error: any) {
    console.error('[Trainer Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name,
        bio: body.bio,
        specialties: body.specialties || [],
        certifications: body.certifications || [],
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        phone: body.phone,
        location: body.location,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedUser
    })
  } catch (error: any) {
    console.error('[Trainer Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
