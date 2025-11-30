import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      sportCategory,
      difficultyLevel,
      durationMinutes,
      content,
      giaPrompt
    } = body

    // Validate required fields
    if (!title || !type || !content) {
      return NextResponse.json({
        error: 'Missing required fields: title, type, content'
      }, { status: 400 })
    }

    // TODO: GiaProgram model not yet implemented in schema
    // Return mock success response for now
    return NextResponse.json({
      success: true,
      program: {
        id: nanoid(),
        title,
        type,
        sportCategory,
      }
    })

  } catch (error: any) {
    console.error('[GIA Save Program] Error:', error)
    return NextResponse.json({
      error: 'Failed to save program',
      details: error.message
    }, { status: 500 })
  }
}
