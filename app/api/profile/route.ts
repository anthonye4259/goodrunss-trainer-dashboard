import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { clerkClient } from '@clerk/nextjs/server'

// GET /api/profile - Get trainer profile
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const updatedTrainer = await prisma.users.update({
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
        updatedAt: new Date(),
      },
    })

    // Also update Clerk user if name or image changed
    if (name || image) {
      try {
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
        await client.users.updateUser(trainer.clerkId, clerkUpdate)
      } catch (clerkError) {
        console.error('Error updating Clerk user:', clerkError)
        // Don't fail the whole request if Clerk update fails
      }
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
