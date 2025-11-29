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

    // Check for hot leads (mock data for now - in production would query leads table)
    // This simulates checking the lead matching system
    const hasHotLeads = true // In production: check leads table for high-score matches
    const hotLeadsCount = 2 // In production: count of leads with score > 90

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

/**
 * Get upcoming schedule for context
 */
export async function getUpcomingSchedule(trainerId: string, daysAhead: number = 7) {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysAhead)

    const sessions = await prisma.sessions.findMany({
        where: {
            trainerId,
            scheduledAt: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            clients: {
                select: { name: true }
            }
        },
        orderBy: {
            scheduledAt: 'asc'
        }
    })

    const today = new Date()
    const todayCount = sessions.filter(s =>
        new Date(s.scheduledAt).getDate() === today.getDate() &&
        new Date(s.scheduledAt).getMonth() === today.getMonth() &&
        new Date(s.scheduledAt).getFullYear() === today.getFullYear()
    ).length

    const nextSession = sessions.find(s => new Date(s.scheduledAt) > new Date())

    return {
        sessions,
        todayCount,
        nextSession: nextSession ? `${nextSession.clients?.name} at ${nextSession.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : undefined
    }
}
