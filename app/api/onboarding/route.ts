import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      specialty,
      city,
      state,
    } = data

    // Find user by Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with onboarding data (only using fields that exist in schema)
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        specialties: specialty ? [specialty] : [],
        city,
        state,
        location: city && state ? `${city}, ${state}` : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        specialty: updatedUser.specialties[0],
        location: updatedUser.location,
      },
    })
  } catch (error: any) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data', details: error.message },
      { status: 500 }
    )
  }
}

// GET - Retrieve onboarding data
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        specialties: true,
        city: true,
        state: true,
        location: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        specialty: dbUser.specialties[0] || null,
        city: dbUser.city,
        state: dbUser.state,
        location: dbUser.location,
        onboardingComplete: dbUser.specialties.length > 0,
      },
    })
  } catch (error: any) {
    console.error('Get onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve onboarding data', details: error.message },
      { status: 500 }
    )
  }
}
