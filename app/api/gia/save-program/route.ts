import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.emailAddresses[0]?.emailAddress }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 })
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

    // Create program
    const program = await prisma.giaProgram.create({
      data: {
        id: nanoid(),
        instructorId: dbUser.id,
        title,
        description,
        type,
        sportCategory,
        difficultyLevel,
        durationMinutes,
        content,
        giaPrompt,
      }
    })

    return NextResponse.json({
      success: true,
      program: {
        id: program.id,
        title: program.title,
        type: program.type,
        sportCategory: program.sportCategory,
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

