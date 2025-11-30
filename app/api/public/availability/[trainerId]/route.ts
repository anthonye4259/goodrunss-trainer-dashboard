import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAY_MAP: { [key: number]: string } = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainerId: string }> }
) {
  try {
    const { trainerId } = await params
    
    // Fetch trainer's availability windows from database
    const windows = await prisma.availabilityWindow.findMany({
      where: {
        trainerId,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    // Convert to format: { Monday: ["09:00 AM", "10:00 AM"], Tuesday: [...], ... }
    const availability: { [key: string]: string[] } = {}
    
    windows.forEach(window => {
      const dayName = DAY_MAP[window.dayOfWeek] || ""
      if (!availability[dayName]) {
        availability[dayName] = []
      }
      // Only add if not already in array (avoid duplicates)
      if (!availability[dayName].includes(window.startTime)) {
        availability[dayName].push(window.startTime)
      }
    })

    return NextResponse.json({
      success: true,
      availability,
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}

