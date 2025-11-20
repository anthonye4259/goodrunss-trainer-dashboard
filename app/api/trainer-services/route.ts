import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { getTrainerServices, setTrainerServices } from "@/lib/storage"

// GET /api/trainer-services - Get trainer's services
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get services from in-memory storage
    // NOTE: This resets on server restart - needs database table for persistence
    const services = getTrainerServices(trainer.id)

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

    // Store in in-memory storage for now
    // NOTE: This resets on server restart - needs database table for persistence
    setTrainerServices(trainer.id, services)

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

