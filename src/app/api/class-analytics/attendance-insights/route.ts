import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * GET /api/class-analytics/attendance-insights
 * Track recurring attendance patterns - regulars vs. drop-offs
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

    // Clients who attended in the last 30 days
    const recentAttendees: any = await prisma.$queryRawUnsafe(`
      SELECT 
        gcb.client_email,
        gcb.client_name,
        COUNT(DISTINCT gcb.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN gcb.checked_in = true THEN gcb.id END) as attended_count,
        MAX(g.scheduled_at) as last_attended,
        AVG(CASE WHEN gcb.checked_in = true THEN 1.0 ELSE 0.0 END) * 100 as attendance_rate
      FROM group_class_bookings gcb
      JOIN group_classes g ON gcb.class_id = g.id
      WHERE g.trainer_id = '${user.id}'
        AND g.scheduled_at >= NOW() - INTERVAL '30 days'
        AND g.scheduled_at <= NOW()
        AND gcb.status = 'confirmed'
      GROUP BY gcb.client_email, gcb.client_name
      HAVING COUNT(DISTINCT gcb.id) > 0
    `)

    // Clients who attended 30-60 days ago but not in last 30 days (dropoffs)
    const dropoffs: any = await prisma.$queryRawUnsafe(`
      SELECT 
        gcb.client_email,
        gcb.client_name,
        COUNT(DISTINCT gcb.id) as total_bookings,
        MAX(g.scheduled_at) as last_attended,
        EXTRACT(DAY FROM (NOW() - MAX(g.scheduled_at))) as days_since_last_attended
      FROM group_class_bookings gcb
      JOIN group_classes g ON gcb.class_id = g.id
      WHERE g.trainer_id = '${user.id}'
        AND g.scheduled_at >= NOW() - INTERVAL '60 days'
        AND g.scheduled_at < NOW() - INTERVAL '30 days'
        AND gcb.status = 'confirmed'
        AND gcb.checked_in = true
        AND NOT EXISTS (
          SELECT 1 FROM group_class_bookings gcb2
          JOIN group_classes g2 ON gcb2.class_id = g2.id
          WHERE gcb2.client_email = gcb.client_email
            AND g2.trainer_id = '${user.id}'
            AND g2.scheduled_at >= NOW() - INTERVAL '30 days'
            AND gcb2.checked_in = true
        )
      GROUP BY gcb.client_email, gcb.client_name
      ORDER BY MAX(g.scheduled_at) DESC
    `)

    // Categorize clients
    const regulars = recentAttendees.filter((c: any) => 
      parseInt(c.attended_count) >= 4 && parseFloat(c.attendance_rate) >= 75
    )
    
    const occasional = recentAttendees.filter((c: any) => 
      parseInt(c.attended_count) >= 2 && parseInt(c.attended_count) < 4
    )
    
    const atRisk = recentAttendees.filter((c: any) => 
      parseInt(c.attended_count) >= 2 && parseFloat(c.attendance_rate) < 60
    )
    
    const newClients = recentAttendees.filter((c: any) => 
      parseInt(c.total_bookings) === 1
    )

    return NextResponse.json({
      success: true,
      insights: {
        regulars: {
          count: regulars.length,
          clients: regulars.map((c: any) => ({
            email: c.client_email,
            name: c.client_name,
            attendedCount: parseInt(c.attended_count),
            totalBookings: parseInt(c.total_bookings),
            attendanceRate: parseFloat(c.attendance_rate).toFixed(1),
            lastAttended: c.last_attended,
            status: 'regular'
          }))
        },
        occasional: {
          count: occasional.length,
          clients: occasional.map((c: any) => ({
            email: c.client_email,
            name: c.client_name,
            attendedCount: parseInt(c.attended_count),
            totalBookings: parseInt(c.total_bookings),
            attendanceRate: parseFloat(c.attendance_rate).toFixed(1),
            lastAttended: c.last_attended,
            status: 'occasional'
          }))
        },
        atRisk: {
          count: atRisk.length,
          clients: atRisk.map((c: any) => ({
            email: c.client_email,
            name: c.client_name,
            attendedCount: parseInt(c.attended_count),
            totalBookings: parseInt(c.total_bookings),
            attendanceRate: parseFloat(c.attendance_rate).toFixed(1),
            lastAttended: c.last_attended,
            status: 'at_risk',
            reason: 'Low attendance rate (< 60%)'
          }))
        },
        dropoffs: {
          count: dropoffs.length,
          clients: dropoffs.map((c: any) => ({
            email: c.client_email,
            name: c.client_name,
            totalBookings: parseInt(c.total_bookings),
            lastAttended: c.last_attended,
            daysSinceLastAttended: parseInt(c.days_since_last_attended),
            status: 'dropped_off',
            reason: `Haven't attended in ${parseInt(c.days_since_last_attended)} days`
          }))
        },
        newClients: {
          count: newClients.length,
          clients: newClients.map((c: any) => ({
            email: c.client_email,
            name: c.client_name,
            attendedCount: parseInt(c.attended_count),
            totalBookings: parseInt(c.total_bookings),
            lastAttended: c.last_attended,
            status: 'new'
          }))
        }
      },
      summary: {
        totalActiveClients: recentAttendees.length,
        regulars: regulars.length,
        occasional: occasional.length,
        atRisk: atRisk.length,
        dropoffs: dropoffs.length,
        newClients: newClients.length,
        retentionRate: recentAttendees.length > 0 
          ? (((recentAttendees.length - dropoffs.length) / recentAttendees.length) * 100).toFixed(1)
          : 0
      }
    })
  } catch (error: any) {
    console.error("Error fetching attendance insights:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

