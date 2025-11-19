import { NextRequest, NextResponse } from "next/server"
import {
  getTrainerServices,
  setTrainerServices,
  setTrainerAvailability,
  setTrainerSportType,
} from "@/lib/storage"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Get services from storage
    const services = getTrainerServices(trainerId)

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
      setTrainerServices(trainerId, services)
    }
    if (sportType) {
      setTrainerSportType(trainerId, sportType)
    }
    if (availability) {
      setTrainerAvailability(trainerId, availability)
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
