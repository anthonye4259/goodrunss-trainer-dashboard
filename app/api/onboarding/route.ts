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
      businessType,
      city,
      state,
      clientCount,
      primaryGoal,
      secondaryGoal,
      timezone,
    } = data

    // Find user by Clerk ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        specialties: specialty ? [specialty] : [],
        business_type: businessType,
        city,
        state,
        location: city && state ? `${city}, ${state}` : null,
        client_count: clientCount,
        primary_goal: primaryGoal,
        secondary_goal: secondaryGoal,
        timezone,
        onboarding_complete: true,
        onboarding_completed_at: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        specialty: updatedUser.specialties[0],
        businessType: updatedUser.business_type,
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
      where: { clerkId: user.id },
      select: {
        id: true,
        specialties: true,
        business_type: true,
        city: true,
        state: true,
        location: true,
        client_count: true,
        primary_goal: true,
        secondary_goal: true,
        timezone: true,
        onboarding_complete: true,
        onboarding_completed_at: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        specialty: dbUser.specialties[0] || null,
        businessType: dbUser.business_type,
        city: dbUser.city,
        state: dbUser.state,
        location: dbUser.location,
        clientCount: dbUser.client_count,
        primaryGoal: dbUser.primary_goal,
        secondaryGoal: dbUser.secondary_goal,
        timezone: dbUser.timezone,
        onboardingComplete: dbUser.onboarding_complete,
        onboardingCompletedAt: dbUser.onboarding_completed_at,
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

