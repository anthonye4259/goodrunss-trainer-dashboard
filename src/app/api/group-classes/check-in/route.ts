import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * POST /api/group-classes/check-in
 * Check in a client to a group class (via QR code or manual)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { classId, clientId, clientEmail, checkInMethod } = body

    if (!classId || (!clientId && !clientEmail)) {
      return NextResponse.json(
        { error: "Class ID and client identifier required" },
        { status: 400 }
      )
    }

    // Find the booking
    let booking: any
    if (clientId) {
      booking = await prisma.$queryRawUnsafe(`
        SELECT * FROM group_class_bookings
        WHERE class_id = '${classId}' AND client_id = '${clientId}' AND status = 'confirmed'
        LIMIT 1
      `)
    } else {
      booking = await prisma.$queryRawUnsafe(`
        SELECT * FROM group_class_bookings
        WHERE class_id = '${classId}' AND client_email = '${clientEmail}' AND status = 'confirmed'
        LIMIT 1
      `)
    }

    if (!booking || booking.length === 0) {
      return NextResponse.json(
        { error: "Booking not found or not confirmed" },
        { status: 404 }
      )
    }

    const bookingId = booking[0].id

    // Mark as checked in
    await prisma.$queryRaw`
      UPDATE group_class_bookings
      SET checked_in = true, checked_in_at = NOW(), check_in_method = ${checkInMethod || 'qr'}
      WHERE id = ${bookingId}
    `

    // Get class info
    const classInfo: any = await prisma.$queryRawUnsafe(`
      SELECT name, scheduled_at FROM group_classes WHERE id = '${classId}'
    `)

    return NextResponse.json({
      success: true,
      message: `✅ Checked in to ${classInfo[0]?.name}!`,
      checkedInAt: new Date()
    })
  } catch (error: any) {
    console.error("Check-in error:", error)
    return NextResponse.json(
      { error: error.message || "Check-in failed" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/group-classes/check-in?classId=xxx
 * Get check-in stats for a class
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const classId = url.searchParams.get("classId")

    if (!classId) {
      return NextResponse.json({ error: "Class ID required" }, { status: 400 })
    }

    // Get check-in stats
    const stats: any = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN checked_in = true THEN 1 END) as checked_in,
        COUNT(CASE WHEN checked_in = false OR checked_in IS NULL THEN 1 END) as not_checked_in
      FROM group_class_bookings
      WHERE class_id = '${classId}' AND status = 'confirmed'
    `)

    // Get list of checked-in clients
    const checkedIn: any = await prisma.$queryRawUnsafe(`
      SELECT client_name, client_email, checked_in_at, check_in_method
      FROM group_class_bookings
      WHERE class_id = '${classId}' AND status = 'confirmed' AND checked_in = true
      ORDER BY checked_in_at DESC
    `)

    return NextResponse.json({
      success: true,
      stats: {
        total: parseInt(stats[0]?.total_bookings) || 0,
        checkedIn: parseInt(stats[0]?.checked_in) || 0,
        notCheckedIn: parseInt(stats[0]?.not_checked_in) || 0,
        attendanceRate: stats[0]?.total_bookings > 0 
          ? ((parseInt(stats[0]?.checked_in) / parseInt(stats[0]?.total_bookings)) * 100).toFixed(0) 
          : 0
      },
      checkedInList: checkedIn
    })
  } catch (error: any) {
    console.error("Error fetching check-in stats:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

