import { prisma } from "@/lib/prisma"
import { analyzeClientRisk, analyzeRevenue, matchLeads } from "./intelligence"

export async function generateNotifications(trainerId: string) {
    // 1. Analyze Client Risk
    const risks = await analyzeClientRisk(trainerId)
    const highRiskClients = risks.filter(r => r.riskLevel === 'high')

    for (const client of highRiskClients) {
        // Check if notification already exists for today
        const existing = await prisma.gia_notifications.findFirst({
            where: {
                trainerId,
                type: 'churn_risk',
                title: `Risk Alert: ${client.clientName}`,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        })

        if (!existing) {
            await prisma.gia_notifications.create({
                data: {
                    trainerId,
                    type: 'churn_risk',
                    title: `Risk Alert: ${client.clientName}`,
                    message: `High churn risk detected. Reasons: ${client.reasons.join(', ')}`,
                    priority: 'critical',
                    actionLabel: 'View Client',
                    actionUrl: `/clients/${client.clientId}`
                }
            })
        }
    }

    // 2. Analyze Revenue Opportunities
    const revenue = await analyzeRevenue(trainerId)
    for (const opportunity of revenue.upsellOpportunities) {
        const existing = await prisma.gia_notifications.findFirst({
            where: {
                trainerId,
                type: 'upsell',
                title: `Upsell Opportunity: ${opportunity.clientName}`,
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        })

        if (!existing) {
            await prisma.gia_notifications.create({
                data: {
                    trainerId,
                    type: 'upsell',
                    title: `Upsell Opportunity: ${opportunity.clientName}`,
                    message: `${opportunity.clientName} is ready for ${opportunity.suggestedPlan}. Potential revenue: +$${opportunity.potentialRevenue}/mo`,
                    priority: 'important',
                    actionLabel: 'Send Offer',
                    actionUrl: `/clients/${opportunity.clientId}`
                }
            })
        }
    }

    // 3. New Leads
    const leads = await matchLeads(trainerId)
    const newLeads = leads.filter(l => l.matchScore > 80)

    if (newLeads.length > 0) {
        const leadNames = newLeads.map(l => l.name).join(', ')
        const existing = await prisma.gia_notifications.findFirst({
            where: {
                trainerId,
                type: 'new_leads',
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        })

        if (!existing) {
            await prisma.gia_notifications.create({
                data: {
                    trainerId,
                    type: 'new_leads',
                    title: `${newLeads.length} New High-Quality Leads`,
                    message: `Top matches: ${leadNames}`,
                    priority: 'info',
                    actionLabel: 'View Leads',
                    actionUrl: '/leads'
                }
            })
        }
    }
}

export async function getUnreadNotifications(trainerId: string) {
    // Generate new notifications first
    await generateNotifications(trainerId)

    return await prisma.gia_notifications.findMany({
        where: {
            trainerId,
            isRead: false
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function markNotificationRead(notificationId: string, trainerId: string) {
    return await prisma.gia_notifications.update({
        where: {
            id: notificationId,
            trainerId // Ensure ownership
        },
        data: {
            isRead: true
        }
    })
}
