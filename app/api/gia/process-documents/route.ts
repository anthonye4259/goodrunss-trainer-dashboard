import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from "@/lib/get-or-create-user"

// POST /api/gia/process-documents - Process and extract client data from documents
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement document processing when schema is ready
    return NextResponse.json({ 
      success: false,
      message: "Feature coming soon - document processing not yet implemented" 
    }, { status: 501 })
  } catch (error) {
    console.error('Error processing documents:', error)
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    )
  }
}

// GET /api/gia/process-documents - Get processed profiles
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement profile fetching when schema is ready
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
