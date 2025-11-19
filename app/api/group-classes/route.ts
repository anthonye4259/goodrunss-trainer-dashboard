import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

// GET /api/group-classes - List all group classes for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement group classes when schema is ready
    return NextResponse.json({ classes: [] })
  } catch (error) {
    console.error("Error fetching group classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch group classes" },
      { status: 500 }
    )
  }
}

// POST /api/group-classes - Create a new group class
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement class creation when schema is ready
    return NextResponse.json({ message: "Feature coming soon" }, { status: 501 })
  } catch (error) {
    console.error("Error creating group class:", error)
    return NextResponse.json(
      { error: "Failed to create group class" },
      { status: 500 }
    )
  }
}
