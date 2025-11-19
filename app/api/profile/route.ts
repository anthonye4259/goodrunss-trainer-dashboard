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
        specialties: true,
        certifications: true,
        hourlyRate: true,
        phone: true,
        location: true,
        address: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        isAvailable: true,
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
      phone,
      bio,
      specialties,
      certifications,
      hourlyRate,
      location,
      address,
      city,
      state,
      postalCode,
      country,
      image,
      isAvailable,
    } = body

    // Update Prisma user
    const updatedTrainer = await prisma.user.update({
      where: { id: trainer.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(specialties !== undefined && { specialties }),
        ...(certifications !== undefined && { certifications }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(location !== undefined && { location }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(postalCode !== undefined && { postalCode }),
        ...(country !== undefined && { country }),
        ...(image !== undefined && { image }),
        ...(isAvailable !== undefined && { isAvailable }),
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
      
      const client = await clerkClient()
      await client.users.updateUser(userId, clerkUpdate)
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


