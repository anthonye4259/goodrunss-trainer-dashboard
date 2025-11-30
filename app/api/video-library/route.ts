import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ExerciseVideo model not yet implemented
    return NextResponse.json({
      success: true,
      videos: [],
      message: 'Video library feature coming soon'
    })
  } catch (error: any) {
    console.error('[Video Library] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ExerciseVideo model not yet implemented
    return NextResponse.json({
      success: true,
      message: 'Video library feature coming soon'
    })
  } catch (error: any) {
    console.error('[Video Library] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    )
  }
}
