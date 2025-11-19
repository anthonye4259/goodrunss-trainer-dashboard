import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

// GET /api/programs - List all programs for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement programs when schema is ready
    return NextResponse.json({ programs: [] })
  } catch (error) {
    console.error("Error fetching programs:", error)
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    )
  }
}

// POST /api/programs - Create a new program
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement program creation when schema is ready
    return NextResponse.json({ message: "Feature coming soon" }, { status: 501 })
  } catch (error) {
    console.error("Error creating program:", error)
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 }
    )
  }
}
