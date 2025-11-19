/**
 * ChatGPT Action: Get Client List
 * Allows ChatGPT to retrieve a trainer's client list
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"



export async function GET(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key')
    
    if (!apiKey || apiKey !== process.env.GPT_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    // Get trainerId from query params
    const { searchParams } = new URL(request.url)
    const trainerId = searchParams.get('trainerId')

    if (!trainerId) {
      return NextResponse.json(
        { error: 'Missing required parameter: trainerId' },
        { status: 400 }
      )
    }

    // Get client profiles from extracted data
    const profiles = await prisma.extractedClientProfile.findMany({
      where: { trainerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        sport: true,
        level: true,
        notes: true,
        goals: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      clients: profiles.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        sport: p.sport || 'Not specified',
        level: p.level || 'Not specified',
        goals: Array.isArray(p.goals) ? p.goals : [],
        status: p.status,
        since: p.createdAt.toISOString().split('T')[0],
      })),
      total: profiles.length,
    })
  } catch (error) {
    console.error('ChatGPT API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve clients' },
      { status: 500 }
    )
  }
}




