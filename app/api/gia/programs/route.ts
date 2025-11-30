import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // GiaProgram model not yet implemented - return empty for now
    return NextResponse.json({
      success: true,
      programs: [],
      message: 'GIA Programs feature coming soon'
    })

  } catch (error: any) {
    console.error('[GIA Programs] Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch programs',
      details: error.message
    }, { status: 500 })
  }
}
