import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/trainer-services - Get trainer's services
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Get services from database when trainer_services table exists
    // For now, return empty services
    const services: any[] = []

    return NextResponse.json({
      success: true,
      services,
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    )
  }
}

// POST /api/trainer-services - Save trainer's services
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { services } = await request.json()

    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { error: "Invalid services data" },
        { status: 400 }
      )
    }

    // TODO: Save to database when trainer_services table exists
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Services saved (temporarily disabled - database table pending)",
      services,
    })
  } catch (error) {
    console.error("Error saving services:", error)
    return NextResponse.json(
      { error: "Failed to save services" },
      { status: 500 }
    )
  }
}

