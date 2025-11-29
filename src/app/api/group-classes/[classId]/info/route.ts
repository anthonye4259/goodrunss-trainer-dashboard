import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/group-classes/[classId]/info
 * Public endpoint - Get class info for check-in page
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    const classInfo: any = await prisma.$queryRawUnsafe(`
      SELECT 
        id, name, description, scheduled_at, duration, location, max_capacity,
        (SELECT COUNT(*) FROM group_class_bookings WHERE class_id = '${classId}' AND status = 'confirmed') as current_bookings
      FROM group_classes
      WHERE id = '${classId}'
    `)

    if (!classInfo || classInfo.length === 0) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      class: {
        id: classInfo[0].id,
        name: classInfo[0].name,
        description: classInfo[0].description,
        scheduledAt: classInfo[0].scheduled_at,
        duration: classInfo[0].duration,
        location: classInfo[0].location,
        maxCapacity: classInfo[0].max_capacity,
        currentBookings: parseInt(classInfo[0].current_bookings) || 0
      }
    })
  } catch (error: any) {
    console.error("Error fetching class info:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

