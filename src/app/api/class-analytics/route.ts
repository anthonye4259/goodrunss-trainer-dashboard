import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * GET /api/class-analytics
 * Get comprehensive class analytics for a trainer
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get("period") || "30" // days
    const classId = url.searchParams.get("classId") // Specific class analytics

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // If specific class analytics requested
    if (classId) {
      const classAnalytics: any = await prisma.$queryRawUnsafe(`
        SELECT 
          g.id,
          g.name,
          g.scheduled_at,
          g.max_capacity,
          g.price_per_person,
          COUNT(DISTINCT gcb.id) as total_bookings,
          COUNT(DISTINCT CASE WHEN gcb.checked_in = true THEN gcb.id END) as checked_in_count,
          COUNT(DISTINCT CASE WHEN gcb.checked_in = false OR gcb.checked_in IS NULL THEN gcb.id END) as no_show_count,
          SUM(gcb.amount_paid) as revenue,
          AVG(CASE WHEN gcb.checked_in = true THEN 1.0 ELSE 0.0 END) * 100 as attendance_rate
        FROM group_classes g
        LEFT JOIN group_class_bookings gcb ON g.id = gcb.class_id AND gcb.status = 'confirmed'
        WHERE g.id = '${classId}' AND g.trainer_id = '${user.id}'
        GROUP BY g.id
      `)

      if (!classAnalytics || classAnalytics.length === 0) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 })
      }

      const data = classAnalytics[0]
      return NextResponse.json({
        success: true,
        class: {
          id: data.id,
          name: data.name,
          scheduledAt: data.scheduled_at,
          maxCapacity: data.max_capacity,
          pricePerPerson: parseFloat(data.price_per_person || 0),
          totalBookings: parseInt(data.total_bookings) || 0,
          checkedIn: parseInt(data.checked_in_count) || 0,
          noShows: parseInt(data.no_show_count) || 0,
          revenue: parseFloat(data.revenue || 0),
          attendanceRate: parseFloat(data.attendance_rate || 0).toFixed(1),
          capacityUtilization: ((parseInt(data.total_bookings) / data.max_capacity) * 100).toFixed(1)
        }
      })
    }

    // Aggregate analytics across all classes
    const overallStats: any = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(DISTINCT g.id) as total_classes,
        COUNT(DISTINCT gcb.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN gcb.checked_in = true THEN gcb.id END) as total_checked_in,
        COUNT(DISTINCT CASE WHEN gcb.checked_in = false OR gcb.checked_in IS NULL THEN gcb.id END) as total_no_shows,
        SUM(g.price_per_person) as total_potential_revenue,
        SUM(CASE WHEN gcb.payment_status = 'paid' THEN gcb.amount_paid ELSE 0 END) as actual_revenue,
        AVG(CASE WHEN gcb.checked_in = true THEN 1.0 ELSE 0.0 END) * 100 as avg_attendance_rate
      FROM group_classes g
      LEFT JOIN group_class_bookings gcb ON g.id = gcb.class_id AND gcb.status = 'confirmed'
      WHERE g.trainer_id = '${user.id}' 
        AND g.scheduled_at >= '${startDate.toISOString()}'
        AND g.scheduled_at <= NOW()
    `)

    // Top performing classes
    const topClasses: any = await prisma.$queryRawUnsafe(`
      SELECT 
        g.id,
        g.name,
        COUNT(DISTINCT gcb.id) as bookings,
        COUNT(DISTINCT CASE WHEN gcb.checked_in = true THEN gcb.id END) as checked_in,
        SUM(CASE WHEN gcb.payment_status = 'paid' THEN gcb.amount_paid ELSE 0 END) as revenue,
        AVG(CASE WHEN gcb.checked_in = true THEN 1.0 ELSE 0.0 END) * 100 as attendance_rate
      FROM group_classes g
      LEFT JOIN group_class_bookings gcb ON g.id = gcb.class_id AND gcb.status = 'confirmed'
      WHERE g.trainer_id = '${user.id}'
        AND g.scheduled_at >= '${startDate.toISOString()}'
        AND g.scheduled_at <= NOW()
      GROUP BY g.id, g.name
      ORDER BY revenue DESC
      LIMIT 10
    `)

    // Attendance trends over time
    const attendanceTrends: any = await prisma.$queryRawUnsafe(`
      SELECT 
        DATE(g.scheduled_at) as date,
        COUNT(DISTINCT g.id) as classes_held,
        COUNT(DISTINCT gcb.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN gcb.checked_in = true THEN gcb.id END) as checked_in,
        AVG(CASE WHEN gcb.checked_in = true THEN 1.0 ELSE 0.0 END) * 100 as attendance_rate
      FROM group_classes g
      LEFT JOIN group_class_bookings gcb ON g.id = gcb.class_id AND gcb.status = 'confirmed'
      WHERE g.trainer_id = '${user.id}'
        AND g.scheduled_at >= '${startDate.toISOString()}'
        AND g.scheduled_at <= NOW()
      GROUP BY DATE(g.scheduled_at)
      ORDER BY DATE(g.scheduled_at) ASC
    `)

    const stats = overallStats[0] || {}

    return NextResponse.json({
      success: true,
      period: `Last ${period} days`,
      overview: {
        totalClasses: parseInt(stats.total_classes) || 0,
        totalBookings: parseInt(stats.total_bookings) || 0,
        totalCheckedIn: parseInt(stats.total_checked_in) || 0,
        totalNoShows: parseInt(stats.total_no_shows) || 0,
        avgAttendanceRate: parseFloat(stats.avg_attendance_rate || 0).toFixed(1),
        actualRevenue: parseFloat(stats.actual_revenue || 0),
        potentialRevenue: parseFloat(stats.total_potential_revenue || 0),
        noShowRate: stats.total_bookings > 0 
          ? ((parseInt(stats.total_no_shows) / parseInt(stats.total_bookings)) * 100).toFixed(1)
          : 0
      },
      topClasses: topClasses.map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        bookings: parseInt(cls.bookings) || 0,
        checkedIn: parseInt(cls.checked_in) || 0,
        revenue: parseFloat(cls.revenue || 0),
        attendanceRate: parseFloat(cls.attendance_rate || 0).toFixed(1)
      })),
      trends: attendanceTrends.map((trend: any) => ({
        date: trend.date,
        classesHeld: parseInt(trend.classes_held) || 0,
        totalBookings: parseInt(trend.total_bookings) || 0,
        checkedIn: parseInt(trend.checked_in) || 0,
        attendanceRate: parseFloat(trend.attendance_rate || 0).toFixed(1)
      }))
    })
  } catch (error: any) {
    console.error("Error fetching class analytics:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

