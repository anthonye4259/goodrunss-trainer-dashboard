/**
 * Settings API
 * Manages user profile and settings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return user profile data
    return NextResponse.json({
      success: true,
      settings: {
        name: user.name || '',
        email: user.email,
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'US',
        timezone: user.timezone || 'America/New_York',
        specialties: user.specialties || [],
        certifications: user.certifications || [],
        hourlyRate: user.hourlyRate || null,
      },
    })
  } catch (error: any) {
    console.error('[API] Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getOrCreateUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name,
      phone,
      bio,
      location,
      city,
      state,
      country,
      timezone,
      specialties,
      certifications,
      hourlyRate,
    } = body

    // Update user in database
    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name : user.name,
        phone: phone !== undefined ? phone : user.phone,
        bio: bio !== undefined ? bio : user.bio,
        location: location !== undefined ? location : user.location,
        city: city !== undefined ? city : user.city,
        state: state !== undefined ? state : user.state,
        country: country !== undefined ? country : user.country,
        timezone: timezone !== undefined ? timezone : user.timezone,
        specialties: specialties !== undefined ? specialties : user.specialties,
        certifications: certifications !== undefined ? certifications : user.certifications,
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : user.hourlyRate,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        location: updatedUser.location,
        city: updatedUser.city,
        state: updatedUser.state,
        country: updatedUser.country,
        timezone: updatedUser.timezone,
        specialties: updatedUser.specialties,
        certifications: updatedUser.certifications,
        hourlyRate: updatedUser.hourlyRate,
      },
    })
  } catch (error: any) {
    console.error('[API] Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings', details: error.message },
      { status: 500 }
    )
  }
}

