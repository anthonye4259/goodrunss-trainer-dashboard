import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Remove tokens from database
    await prisma.users.update({
      where: { clerkId: user.id },
      data: {
        google_access_token: null,
        google_refresh_token: null,
        google_token_expires_at: null,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Google Calendar disconnected for user:', user.id)

    return NextResponse.json({ success: true, message: 'Google Calendar disconnected' })
  } catch (error) {
    console.error('[Google OAuth] Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    )
  }
}

