/**
 * ChatGPT Action: Get Schedule
 * Allows ChatGPT to view a trainer's schedule and bookings
 */

import { NextRequest, NextResponse } from 'next/server'

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

    // Mock schedule data (replace with real Prisma queries when you have booking models)
    const today = new Date()
    const thisWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return date.toISOString().split('T')[0]
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule retrieved successfully',
      schedule: {
        week: thisWeek,
        upcomingBookings: [
          // Mock data - replace with real bookings
          {
            date: thisWeek[1],
            time: '10:00 AM',
            client: 'Demo Client',
            service: 'Training Session',
            status: 'confirmed',
          },
        ],
        availableSlots: [
          // Mock data - replace with real availability
          { date: thisWeek[0], time: '9:00 AM' },
          { date: thisWeek[0], time: '11:00 AM' },
          { date: thisWeek[2], time: '2:00 PM' },
        ],
      },
      trainerId,
    })
  } catch (error) {
    console.error('ChatGPT API Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve schedule' },
      { status: 500 }
    )
  }
}



