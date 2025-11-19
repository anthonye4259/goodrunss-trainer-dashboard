import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

// GET /api/waitlist - Get waitlist entries for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement waitlist when schema is ready
    return NextResponse.json({ waitlist: [] })
  } catch (error) {
    console.error("Error fetching waitlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch waitlist" },
      { status: 500 }
    )
  }
}

// POST /api/waitlist - Add to waitlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement waitlist addition when schema is ready
    return NextResponse.json({ message: "Feature coming soon" }, { status: 501 })
  } catch (error) {
    console.error("Error adding to waitlist:", error)
    return NextResponse.json(
      { error: "Failed to add to waitlist" },
      { status: 500 }
    )
  }
}
