import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"

// GET /api/packages - List all packages for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement packages when schema is ready
    return NextResponse.json({ packages: [] })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}

// POST /api/packages - Create a new package
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Implement package creation when schema is ready
    return NextResponse.json({ message: "Feature coming soon" }, { status: 501 })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    )
  }
}
