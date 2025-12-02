import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status') || undefined

        // Get today's date at midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Fetch leads
        const leads = await prisma.dailyLead.findMany({
            where: {
                trainerId: dbUser.id,
                ...(status && { status })
            },
            orderBy: [
                { createdAt: 'desc' },
                { matchScore: 'desc' }
            ],
            take: limit
        })

        // Count today's leads
        const todayCount = await prisma.dailyLead.count({
            where: {
                trainerId: dbUser.id,
                createdAt: {
                    gte: today
                },
                status: 'new'
            }
        })

        return NextResponse.json({
            leads,
            todayCount
        })
    } catch (error: any) {
        console.error('Error fetching daily leads:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { leadId, status, contactedAt } = await req.json()

        const updated = await prisma.dailyLead.update({
            where: {
                id: leadId,
                trainerId: dbUser.id // Ensure user owns this lead
            },
            data: {
                status,
                ...(contactedAt && { contactedAt: new Date(contactedAt) })
            }
        })

        return NextResponse.json({ lead: updated })
    } catch (error: any) {
        console.error('Error updating lead:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
