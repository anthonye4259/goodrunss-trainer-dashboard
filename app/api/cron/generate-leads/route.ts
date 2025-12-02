import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLeadsForTrainer, storeLeadsInDatabase } from '@/lib/social/lead-generator'

export async function GET(req: NextRequest) {
    try {
        // Verify cron secret
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log('[CRON] Starting daily lead generation...')

        // Get all trainers
        const trainers = await prisma.users.findMany({
            where: {
                role: 'TRAINER',
                onboarding_complete: true
            },
            select: {
                id: true,
                name: true,
                specialties: true,
                location: true,
                city: true,
                state: true
            }
        })

        console.log(`[CRON] Found ${trainers.length} trainers`)

        let totalLeadsGenerated = 0
        const results = []

        for (const trainer of trainers) {
            try {
                console.log(`[CRON] Generating leads for trainer: ${trainer.name} (${trainer.id})`)

                // Generate leads
                const leads = await generateLeadsForTrainer(trainer)

                // Store in database
                const stored = await storeLeadsInDatabase(leads)

                // Create notification if leads were generated
                if (stored.length > 0) {
                    await prisma.notifications.create({
                        data: {
                            userId: trainer.id,
                            type: 'daily_leads_ready',
                            title: 'New Leads Available',
                            message: `${stored.length} new lead${stored.length > 1 ? 's' : ''} ready for you today!`,
                            read: false
                        }
                    })
                }

                totalLeadsGenerated += stored.length

                results.push({
                    trainerId: trainer.id,
                    trainerName: trainer.name,
                    leadsGenerated: stored.length
                })

                console.log(`[CRON] Generated ${stored.length} leads for ${trainer.name}`)
            } catch (error) {
                console.error(`[CRON] Error generating leads for trainer ${trainer.id}:`, error)
                results.push({
                    trainerId: trainer.id,
                    trainerName: trainer.name,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        console.log(`[CRON] Completed! Total leads generated: ${totalLeadsGenerated}`)

        return NextResponse.json({
            success: true,
            totalTrainers: trainers.length,
            totalLeadsGenerated,
            results
        })
    } catch (error: any) {
        console.error('[CRON] Fatal error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate leads' },
            { status: 500 }
        )
    }
}
