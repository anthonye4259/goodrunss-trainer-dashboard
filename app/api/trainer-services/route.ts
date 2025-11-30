import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TrainerService model not yet implemented
    return NextResponse.json({
      success: true,
      services: [],
      message: 'Trainer services feature coming soon'
    })
  } catch (error: any) {
    console.error('[Trainer Services] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
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

    // TrainerService model not yet implemented
    return NextResponse.json({
      success: true,
      message: 'Trainer services feature coming soon'
    })
  } catch (error: any) {
    console.error('[Trainer Services] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}
