import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import {
    analyzeClassPerformance,
    analyzeRecurringAttendance,
    ClassInsight,
    AttendancePattern
} from "@/lib/gia/intelligence"

export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const dbUser = await getOrCreateUser()

        // Get class performance insights
        const classInsights = await analyzeClassPerformance(dbUser.id)

        // Get attendance patterns
        const attendancePatterns = await analyzeRecurringAttendance(dbUser.id)

        // Calculate revenue breakdown
        const revenueBreakdown = {
            dropIn: 0,
            packages: 0,
            total: 0
        }

        // Calculate total revenue from class insights
        const totalRevenue = classInsights.reduce((sum, c) => sum + c.revenuePerClass, 0)
        revenueBreakdown.total = totalRevenue
        revenueBreakdown.packages = totalRevenue * 0.6 // Estimate 60% from packages
        revenueBreakdown.dropIn = totalRevenue * 0.4 // Estimate 40% from drop-ins

        // Get top performing classes
        const topPerformingClasses = classInsights
            .filter(c => c.profitability === 'high')
            .slice(0, 5)
            .map(c => ({
                classId: c.classId,
                className: c.className,
                revenue: c.revenuePerClass,
                attendance: c.averageAttendance
            }))

        // Generate recommendations
        const recommendations: string[] = []

        const lowPerforming = classInsights.filter(c => c.profitability === 'low')
        if (lowPerforming.length > 0) {
            recommendations.push(`${lowPerforming.length} class${lowPerforming.length > 1 ? 'es' : ''} underperforming - consider schedule adjustments`)
        }

        const dropoffs = attendancePatterns.filter(p => p.dropoffDetected)
        if (dropoffs.length > 0) {
            recommendations.push(`${dropoffs.length} client${dropoffs.length > 1 ? 's' : ''} showing attendance dropoff - send check-in messages`)
        }

        const highAttendance = attendancePatterns.filter(p => p.attendanceRate > 80)
        if (highAttendance.length > 0) {
            recommendations.push(`${highAttendance.length} client${highAttendance.length > 1 ? 's' : ''} with 80%+ attendance - upsell opportunity`)
        }

        return NextResponse.json({
            success: true,
            data: {
                classInsights,
                attendancePatterns,
                revenueBreakdown,
                topPerformingClasses,
                recommendations
            }
        })
    } catch (error: any) {
        console.error("[CLASS_ANALYTICS_ERROR]", error)
        return NextResponse.json(
            { error: "Failed to fetch class analytics", details: error.message },
            { status: 500 }
        )
    }
}
