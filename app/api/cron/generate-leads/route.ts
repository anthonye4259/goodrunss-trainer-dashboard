import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLeadsForTrainer, storeLeadsInDatabase } from '@/lib/social/lead-generator'

// Allow up to 60 seconds for lead generation
export const maxDuration = 60

export async function GET(req: NextRequest) {
    try {
        // Verify cron secret OR Vercel cron header
        const authHeader = req.headers.get('authorization')
        const isVercelCron = req.headers.get('x-vercel-cron') === '1'
        const hasCronSecret = authHeader === `Bearer ${process.env.CRON_SECRET}`
        
        // Allow if it's a Vercel cron job OR has the correct secret
        if (!isVercelCron && !hasCronSecret && process.env.NODE_ENV === 'production') {
            console.log('[CRON] Unauthorized - missing cron auth')
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
                    await prisma.gia_notifications.create({
                        data: {
                            trainerId: trainer.id,
                            type: 'daily_leads_ready',
                            title: 'New Leads Available',
                            message: `${stored.length} new lead${stored.length > 1 ? 's' : ''} ready for you today!`,
                            priority: 'medium',
                            isRead: false
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

// POST endpoint for manual trigger (authenticated users only)
export async function POST(req: NextRequest) {
    try {
        // Import auth
        const { getOrCreateUser } = await import('@/lib/get-or-create-user')
        const user = await getOrCreateUser()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        console.log(`[CRON] Manual trigger by user: ${user.id}`)

        // Generate leads for just this user
        const trainer = await prisma.users.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                name: true,
                specialties: true,
                location: true,
                city: true,
                state: true
            }
        })

        if (!trainer) {
            return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
        }

        console.log(`[CRON] Generating leads for trainer: ${trainer.name}`)

        // Generate leads
        const leads = await generateLeadsForTrainer(trainer)
        console.log(`[CRON] Generated ${leads.length} leads`)

        // Store in database
        const stored = await storeLeadsInDatabase(leads)
        console.log(`[CRON] Stored ${stored.length} leads`)

        // Create notification
        if (stored.length > 0) {
            await prisma.gia_notifications.create({
                data: {
                    trainerId: trainer.id,
                    type: 'daily_leads_ready',
                    title: 'New Leads Available',
                    message: `${stored.length} new lead${stored.length > 1 ? 's' : ''} generated!`,
                    priority: 'medium',
                    isRead: false
                }
            })
        }

        return NextResponse.json({
            success: true,
            leadsGenerated: stored.length,
            leads: stored.map(l => ({
                id: l.id,
                name: l.name,
                source: l.source,
                matchScore: l.matchScore,
                context: l.context
            }))
        })
    } catch (error: any) {
        console.error('[CRON] Manual trigger error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to generate leads' },
            { status: 500 }
        )
    }
}
