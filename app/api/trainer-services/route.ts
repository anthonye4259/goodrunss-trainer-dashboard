import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"

// GET /api/trainer-services - Get trainer's services
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return from trainer's publicMetadata or empty array
    // TODO: Create trainer_services table in database
    const services = trainer.publicMetadata?.services || []

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

    // Store in trainer's metadata for now
    // TODO: Store in proper database table
    // For now, we'll use localStorage on client side

    return NextResponse.json({
      success: true,
      message: "Services saved",
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

