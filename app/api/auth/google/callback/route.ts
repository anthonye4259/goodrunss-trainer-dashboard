import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error('[Google OAuth] Error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?google_error=access_denied', request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?google_error=no_code', request.url)
      )
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${request.nextUrl.origin}/api/auth/google/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error('No access token received')
    }

    // Save tokens to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token || null,
        google_token_expires_at: tokens.expiry_date 
          ? new Date(tokens.expiry_date) 
          : null,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Google Calendar connected for user:', user.id)

    return NextResponse.redirect(
      new URL('/dashboard/settings?google_connected=true', request.url)
    )
  } catch (error: any) {
    console.error('[Google OAuth] Callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?google_error=callback_failed', request.url)
    )
  }
}

