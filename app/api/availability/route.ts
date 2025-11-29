import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"

const DAY_MAP: { [key: string]: number } = {
  "Monday": 1,
  "Tuesday": 2,
  "Wednesday": 3,
  "Thursday": 4,
  "Friday": 5,
  "Saturday": 6,
  "Sunday": 0,
}

// GET /api/availability - Get trainer's availability
export async function GET(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all availability windows from database
    const windows = await prisma.availability_windows.findMany({
      where: {
        trainerId: trainer.id,
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    })

    // Convert to simple format: { Monday: ["09:00 AM", "10:00 AM"], ... }
    const availability: { [key: string]: string[] } = {}
    
    windows.forEach(window => {
      const dayName = Object.keys(DAY_MAP).find(key => DAY_MAP[key] === window.dayOfWeek) || ""
      if (!availability[dayName]) {
        availability[dayName] = []
      }
      availability[dayName].push(window.startTime)
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

// POST /api/availability - Save trainer's availability
export async function POST(request: NextRequest) {
  try {
    const trainer = await getOrCreateUser()

    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { availability } = await request.json()

    if (!availability || typeof availability !== "object") {
      return NextResponse.json(
        { error: "Invalid availability data" },
        { status: 400 }
      )
    }

    // Delete existing availability windows
    await prisma.availability_windows.deleteMany({
      where: { trainerId: trainer.id },
    })

    // Create new availability windows
    const windowsToCreate: any[] = []

    Object.entries(availability).forEach(([day, times]) => {
      const dayOfWeek = DAY_MAP[day]
      if (dayOfWeek !== undefined && Array.isArray(times)) {
        times.forEach((time: string) => {
          windowsToCreate.push({
            id: crypto.randomUUID(),
            trainerId: trainer.id,
            dayOfWeek,
            startTime: time,
            endTime: getEndTime(time), // 1 hour slots
            isRecurring: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        })
      }
    })

    if (windowsToCreate.length > 0) {
      await prisma.availability_windows.createMany({
        data: windowsToCreate,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Availability saved to database",
    })
  } catch (error) {
    console.error("Error saving availability:", error)
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    )
  }
}

// Helper function to calculate end time (1 hour later)
function getEndTime(startTime: string): string {
  const [time, period] = startTime.split(" ")
  let [hours, minutes] = time.split(":").map(Number)
  
  hours += 1
  
  if (hours === 12 && period === "AM") {
    return `12:${minutes.toString().padStart(2, "0")} PM`
  } else if (hours === 13 && period === "PM") {
    return `01:${minutes.toString().padStart(2, "0")} PM`
  } else if (hours > 12) {
    hours -= 12
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} PM`
  }
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`
}

