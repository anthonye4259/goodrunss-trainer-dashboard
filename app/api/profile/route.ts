import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/profile - Get trainer profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        rating: true,
        totalSessions: true,
        bio: true,
        specialty: true,
        certifications: true,
        yearsExperience: true,
        hourlyRate: true,
        language: true,
        timezone: true,
        phoneNumber: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      profile: trainer,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update trainer profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      phoneNumber,
      bio,
      specialty,
      certifications,
      yearsExperience,
      hourlyRate,
      language,
      timezone,
      address,
      city,
      state,
      zipCode,
      country,
      image,
    } = body

    // Update Prisma user
    const updatedTrainer = await prisma.user.update({
      where: { id: trainer.id },
      data: {
        ...(name && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(bio !== undefined && { bio }),
        ...(specialty !== undefined && { specialty }),
        ...(certifications !== undefined && { certifications }),
        ...(yearsExperience !== undefined && { yearsExperience }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(language !== undefined && { language }),
        ...(timezone !== undefined && { timezone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(image !== undefined && { image }),
      },
    })

    // Also update Clerk user if name or image changed
    if (name || image) {
      const clerkUpdate: any = {}
      if (name) {
        const [firstName, ...lastNameParts] = name.split(' ')
        clerkUpdate.firstName = firstName
        clerkUpdate.lastName = lastNameParts.join(' ') || undefined
      }
      if (image) {
        clerkUpdate.profileImageUrl = image
      }
      
      await clerkClient.users.updateUser(userId, clerkUpdate)
    }

    return NextResponse.json({
      success: true,
      profile: updatedTrainer,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}


