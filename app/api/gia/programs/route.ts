import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: GiaProgram model not yet implemented in schema
    // Return empty array for now
    return NextResponse.json({
      success: true,
      programs: []
    })

  } catch (error: any) {
    console.error('[GIA Programs] Error:', error)
    return NextResponse.json({
      error: 'Failed to fetch programs',
      details: error.message
    }, { status: 500 })
  }
}
