import { prisma } from "@/lib/prisma"

/**
 * Core intelligence functions for Proactive Gia
 * Analyzes trainer's business and generates actionable insights
 */

export interface ClientRisk {
    clientId: string
    clientName: string
    riskScore: number // 0-100
    riskLevel: 'low' | 'medium' | 'high'
    reasons: string[]
    recommendedAction: string
}

export interface RevenueInsight {
    currentMRR: number
    growth: number // percentage
    upsellOpportunities: {
        clientId: string
        clientName: string
        currentPlan: string
        suggestedPlan: string
        potentialRevenue: number
    }[]
    forecast: number
}

export interface ActionRecommendation {
    id: string
    priority: 'critical' | 'important' | 'info'
    title: string
    description: string
    actionUrl: string
    actionLabel: string
}

export interface ClassInsight {
    classId: string
    className: string
    revenuePerClass: number
    averageAttendance: number
    attendanceTrend: 'increasing' | 'stable' | 'declining'
    profitability: 'high' | 'medium' | 'low'
    recommendations: string[]
}

export interface AttendancePattern {
    clientId: string
    clientName: string
    classType: string
    attendanceRate: number // percentage
    dropoffDetected: boolean
    lastAttended: Date | null
    missedClasses: number
    recommendation: string
}

/**
 * Analyze client risk of churning
 */
export async function analyzeClientRisk(trainerId: string): Promise<ClientRisk[]> {
    const clients = await prisma.clients.findMany({
        where: { trainerId },
        select: {
            id: true,
            name: true,
            lastSessionDate: true,
            sessionsCount: true,
            createdAt: true,
        }
    })

    const risks: ClientRisk[] = []

    for (const client of clients) {
        const reasons: string[] = []
        let riskScore = 0

        // Check last session date
        if (client.lastSessionDate) {
            const daysSinceLastSession = Math.floor(
                (Date.now() - new Date(client.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
            )

            if (daysSinceLastSession > 7) {
                riskScore += daysSinceLastSession * 5
                reasons.push(`No session in ${daysSinceLastSession} days`)
            }
        } else {
            riskScore += 50
            reasons.push('No sessions logged')
        }

        // Check session frequency
        if (client.sessionsCount < 3) {
            riskScore += 30
            reasons.push('Low engagement (< 3 sessions)')
        }

        // Check class attendance (if available)
        try {
            const classAttendance = await prisma.classAttendance.count({
                where: {
                    clientId: client.id,
                    attendedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            })

            if (classAttendance === 0) {
                riskScore += 20
                reasons.push('No class attendance in 30 days')
            }
        } catch (error) {
            // ClassAttendance table might not exist yet
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high'
        if (riskScore >= 60) riskLevel = 'high'
        else if (riskScore >= 30) riskLevel = 'medium'
        else riskLevel = 'low'

        // Only include medium and high risk clients
        if (riskLevel !== 'low') {
            risks.push({
                clientId: client.id,
                clientName: client.name,
                riskScore,
                riskLevel,
                reasons,
                recommendedAction: riskLevel === 'high'
                    ? 'Send urgent check-in message'
                    : 'Schedule follow-up call'
            })
        }
    }

    // Sort by risk score descending
    return risks.sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Analyze revenue trends and opportunities
 */
export async function analyzeRevenue(trainerId: string): Promise<RevenueInsight> {
    // Get current month payments
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const currentMonthPayments = await prisma.payments.findMany({
        where: {
            trainerId,
            status: 'COMPLETED',
            paidAt: { gte: firstDayOfMonth }
        }
    })

    const lastMonthPayments = await prisma.payments.findMany({
        where: {
            trainerId,
            status: 'COMPLETED',
            paidAt: { gte: lastMonth, lte: lastMonthEnd }
        }
    })

    const currentMRR = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0)
    const lastMRR = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0)
    const growth = lastMRR > 0 ? ((currentMRR - lastMRR) / lastMRR) * 100 : 0

    // Find upsell opportunities (clients with high engagement, low price)
    const clients = await prisma.clients.findMany({
        where: { trainerId },
        select: {
            id: true,
            name: true,
            sessionsCount: true,
            payments: {
                where: { status: 'COMPLETED' },
                orderBy: { paidAt: 'desc' },
                take: 1
            }
        }
    })

    const upsellOpportunities = clients
        .filter(c => c.sessionsCount >= 10 && c.payments[0]?.amount < 100)
        .map(c => ({
            clientId: c.id,
            clientName: c.name,
            currentPlan: `$${c.payments[0]?.amount || 0}/month`,
            suggestedPlan: '$150/month Premium',
            potentialRevenue: 150 - (c.payments[0]?.amount || 0)
        }))
        .slice(0, 5)

    return {
        currentMRR,
        growth,
        upsellOpportunities,
        forecast: currentMRR * 1.15 // Simple 15% growth forecast
    }
}

/**
 * Analyze class performance and revenue
 */
export async function analyzeClassPerformance(trainerId: string): Promise<ClassInsight[]> {
    try {
        // Get all classes for the trainer
        const classes = await prisma.group_classes.findMany({
            where: { trainer_id: trainerId },
            select: {
                id: true,
                name: true,
                price_per_person: true,
                max_capacity: true,
                created_at: true
            }
        })

        const insights: ClassInsight[] = []

        for (const classItem of classes) {
            // Get attendance for this class
            const attendance = await prisma.classAttendance.findMany({
                where: {
                    classId: classItem.id,
                    attendedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            })

            const totalAttendance = attendance.length
            const averageAttendance = totalAttendance > 0 ? totalAttendance / 4 : 0 // Assuming ~4 weeks

            // Calculate revenue
            const revenuePerClass = Number(classItem.price_per_person) * averageAttendance

            // Determine attendance trend (simplified)
            const recentAttendance = attendance.filter(a =>
                new Date(a.attendedAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            ).length
            const olderAttendance = attendance.filter(a =>
                new Date(a.attendedAt) <= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            ).length

            let attendanceTrend: 'increasing' | 'stable' | 'declining'
            if (recentAttendance > olderAttendance * 1.2) attendanceTrend = 'increasing'
            else if (recentAttendance < olderAttendance * 0.8) attendanceTrend = 'declining'
            else attendanceTrend = 'stable'

            // Determine profitability
            const capacityUtilization = averageAttendance / classItem.max_capacity
            let profitability: 'high' | 'medium' | 'low'
            if (capacityUtilization > 0.7) profitability = 'high'
            else if (capacityUtilization > 0.4) profitability = 'medium'
            else profitability = 'low'

            // Generate recommendations
            const recommendations: string[] = []
            if (profitability === 'low') {
                recommendations.push('Consider adjusting class time or reducing frequency')
            }
            if (attendanceTrend === 'declining') {
                recommendations.push('Attendance declining - survey participants for feedback')
            }
            if (capacityUtilization > 0.9) {
                recommendations.push('High demand - consider adding another session')
            }

            insights.push({
                classId: classItem.id,
                className: classItem.name,
                revenuePerClass,
                averageAttendance,
                attendanceTrend,
                profitability,
                recommendations
            })
        }

        return insights.sort((a, b) => b.revenuePerClass - a.revenuePerClass)
    } catch (error) {
        console.error('Error analyzing class performance:', error)
        return []
    }
}

/**
 * Analyze recurring attendance patterns and detect dropoffs
 */
export async function analyzeRecurringAttendance(trainerId: string): Promise<AttendancePattern[]> {
    try {
        const clients = await prisma.clients.findMany({
            where: { trainerId },
            select: {
                id: true,
                name: true
            }
        })

        const patterns: AttendancePattern[] = []

        for (const client of clients) {
            const attendance = await prisma.classAttendance.findMany({
                where: { clientId: client.id },
                orderBy: { attendedAt: 'desc' }
            })

            if (attendance.length === 0) continue

            const totalClasses = attendance.length
            const last30Days = attendance.filter(a =>
                new Date(a.attendedAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            )
            const previous30Days = attendance.filter(a => {
                const date = new Date(a.attendedAt)
                return date > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
                    date <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            })

            const attendanceRate = (last30Days.length / 8) * 100 // Assuming 8 possible classes per month
            const dropoffDetected = previous30Days.length > 0 && last30Days.length < previous30Days.length * 0.5

            const lastAttended = attendance[0] ? new Date(attendance[0].attendedAt) : null
            const daysSinceLastClass = lastAttended
                ? Math.floor((Date.now() - lastAttended.getTime()) / (1000 * 60 * 60 * 24))
                : 999

            const missedClasses = daysSinceLastClass > 7 ? Math.floor(daysSinceLastClass / 7) : 0

            let recommendation = ''
            if (dropoffDetected) {
                recommendation = 'Significant dropoff detected - send check-in message'
            } else if (missedClasses > 2) {
                recommendation = `Missed ${missedClasses} classes - reach out to re-engage`
            } else if (attendanceRate > 80) {
                recommendation = 'Excellent attendance - consider upselling to unlimited package'
            }

            if (dropoffDetected || missedClasses > 2 || attendanceRate > 80) {
                patterns.push({
                    clientId: client.id,
                    clientName: client.name,
                    classType: 'Group Classes', // Could be enhanced with actual class types
                    attendanceRate,
                    dropoffDetected,
                    lastAttended,
                    missedClasses,
                    recommendation
                })
            }
        }

        return patterns.sort((a, b) => {
            if (a.dropoffDetected && !b.dropoffDetected) return -1
            if (!a.dropoffDetected && b.dropoffDetected) return 1
            return b.missedClasses - a.missedClasses
        })
    } catch (error) {
        console.error('Error analyzing attendance patterns:', error)
        return []
    }
}

/**
 * Generate recommended actions for trainer
 */
export async function generateRecommendations(trainerId: string): Promise<ActionRecommendation[]> {
    const recommendations: ActionRecommendation[] = []

    // Get at-risk clients
    const risks = await analyzeClientRisk(trainerId)
    const highRiskClients = risks.filter(r => r.riskLevel === 'high')

    if (highRiskClients.length > 0) {
        recommendations.push({
            id: 'high-risk-clients',
            priority: 'critical',
            title: `${highRiskClients.length} client${highRiskClients.length > 1 ? 's' : ''} at high churn risk`,
            description: `${highRiskClients.map(c => c.clientName).join(', ')} need immediate attention`,
            actionUrl: '/dashboard/clients',
            actionLabel: 'Review Clients'
        })
    }

    // Get revenue insights
    const revenue = await analyzeRevenue(trainerId)

    if (revenue.upsellOpportunities.length > 0) {
        recommendations.push({
            id: 'upsell-opportunities',
            priority: 'important',
            title: `${revenue.upsellOpportunities.length} upsell opportunities`,
            description: `Potential additional revenue: $${revenue.upsellOpportunities.reduce((sum, o) => sum + o.potentialRevenue, 0)}/month`,
            actionUrl: '/dashboard/clients',
            actionLabel: 'View Opportunities'
        })
    }

    if (revenue.growth < 0) {
        recommendations.push({
            id: 'revenue-decline',
            priority: 'critical',
            title: 'Revenue declining',
            description: `Down ${Math.abs(revenue.growth).toFixed(1)}% vs last month`,
            actionUrl: '/dashboard/analytics',
            actionLabel: 'View Analytics'
        })
    }

    // Get class insights
    const classInsights = await analyzeClassPerformance(trainerId)
    const lowPerformingClasses = classInsights.filter(c => c.profitability === 'low')

    if (lowPerformingClasses.length > 0) {
        recommendations.push({
            id: 'low-performing-classes',
            priority: 'important',
            title: `${lowPerformingClasses.length} underperforming class${lowPerformingClasses.length > 1 ? 'es' : ''}`,
            description: `${lowPerformingClasses.map(c => c.className).join(', ')} need optimization`,
            actionUrl: '/dashboard/classes',
            actionLabel: 'Review Classes'
        })
    }

    // Get attendance patterns
    const attendancePatterns = await analyzeRecurringAttendance(trainerId)
    const dropoffClients = attendancePatterns.filter(p => p.dropoffDetected)

    if (dropoffClients.length > 0) {
        recommendations.push({
            id: 'attendance-dropoff',
            priority: 'critical',
            title: `${dropoffClients.length} client${dropoffClients.length > 1 ? 's' : ''} stopped attending classes`,
            description: `${dropoffClients.map(c => c.clientName).join(', ')} showing attendance dropoff`,
            actionUrl: '/dashboard/clients',
            actionLabel: 'Re-engage Clients'
        })
    }

    // Check for hot leads (mock data for now - in production would query leads table)
    const hasHotLeads = true
    const hotLeadsCount = 2

    if (hasHotLeads) {
        recommendations.push({
            id: 'hot-leads',
            priority: 'important',
            title: `${hotLeadsCount} hot leads waiting`,
            description: `Gia found ${hotLeadsCount} high-quality leads (90%+ match) ready to convert`,
            actionUrl: '/dashboard/client-leads',
            actionLabel: 'Contact Leads'
        })
    }

    return recommendations
}

/**
 * Match leads with trainer profile
 */
export async function matchLeads(trainerId: string) {
    // In a real implementation, this would query the leads table and use
    // vector search or algorithm matching against trainer profile.
    // For now, we'll return mock high-quality leads.

    return [
        {
            id: 'lead-1',
            name: 'Jessica Chen',
            matchScore: 95,
            sport: 'Tennis',
            goals: ['Weight Loss', 'Strength']
        },
        {
            id: 'lead-2',
            name: 'Marcus Williams',
            matchScore: 88,
            sport: 'Golf',
            goals: ['Flexibility', 'Core']
        }
    ]
}
