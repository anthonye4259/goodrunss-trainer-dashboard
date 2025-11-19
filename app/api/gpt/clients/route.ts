import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/gpt/clients - Get extracted client profiles
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement extracted profiles when schema is ready
    return NextResponse.json({
      success: true,
      profiles: [],
    })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
