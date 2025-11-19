import { NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for services (MVP)
// TODO: Move to database table in production
const servicesStorage = new Map<string, any>()
const availabilityStorage = new Map<string, any>()
const sportTypeStorage = new Map<string, string>()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Get services from in-memory storage
    const services = servicesStorage.get(trainerId) || []

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    const { services, sportType, availability } = await request.json()

    // Store in memory
    if (services) {
      servicesStorage.set(trainerId, services)
    }
    if (sportType) {
      sportTypeStorage.set(trainerId, sportType)
    }
    if (availability) {
      availabilityStorage.set(trainerId, availability)
    }

    return NextResponse.json({
      success: true,
      message: "Data saved (in-memory storage)",
    })
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    )
  }
}

// Export storage for use by other APIs
export { servicesStorage, availabilityStorage, sportTypeStorage }
