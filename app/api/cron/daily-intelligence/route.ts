import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// This route should be protected with a secret key for Cron jobs
export async function GET(req: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow local development testing without secret
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        console.log('[Daily Intelligence] Starting daily analysis...')

        // 1. Analyze Retention Risk for all active clients
        // In a real app, we'd batch this or use a queue
        const activeClients = await prisma.clients.findMany({
            where: {
                // In a real app, filter for active status
            },
            include: {
                trainer_sessions: {
                    orderBy: { scheduledAt: 'desc' },
                    take: 5
                }
            }
        })

        console.log(`[Daily Intelligence] Analyzing ${activeClients.length} clients for churn risk...`)

        const risks = []
        for (const client of activeClients) {
            // We'll use our existing intelligence function
            // Note: analyzeRetentionRisk needs to be adapted to take a client object or ID
            // For now, we'll simulate the logic here or call the function if it supports it

            const lastSession = client.trainer_sessions[0]
            const daysSinceLastSession = lastSession
                ? Math.floor((Date.now() - new Date(lastSession.scheduledAt).getTime()) / (1000 * 60 * 60 * 24))
                : 30 // Default if no sessions

            if (daysSinceLastSession > 14) {
                risks.push({
                    clientId: client.id,
                    clientName: client.name,
                    riskLevel: daysSinceLastSession > 30 ? 'high' : 'medium',
                    reasons: [`No sessions in ${daysSinceLastSession} days`],
                    detectedAt: new Date()
                })
            }
        }

        // 2. Identify New Leads (Mock logic for now, would query leads table)
        // In production: await prisma.leads.findMany({ where: { createdAt: { gt: yesterday } } })
        const newLeadsCount = 2 // Simulated

        // 3. Store Insights
        // We'll store this in a DailyInsights table or cache
        // For now, we'll just log it
        console.log('[Daily Intelligence] Analysis complete:', {
            clientsAnalyzed: activeClients.length,
            atRiskClients: risks.length,
            newLeads: newLeadsCount
        })

        // In a real implementation, we would:
        // 1. Save these insights to the database
        // 2. Trigger notifications for critical risks
        // 3. Queue up "Draft Intro" tasks for new leads

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            summary: {
                clientsAnalyzed: activeClients.length,
                atRiskClients: risks.length,
                newLeads: newLeadsCount
            },
            risks: risks.slice(0, 5) // Return top 5 risks
        })

    } catch (error: any) {
        console.error('[Daily Intelligence] Error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
