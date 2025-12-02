import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()
        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { leadIds, action } = await req.json()

        if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: 'Invalid leadIds' }, { status: 400 })
        }

        if (!['contact', 'dismiss', 'contacted'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // Map action to status
        const statusMap: Record<string, string> = {
            contact: 'contacted',
            dismiss: 'dismissed',
            contacted: 'contacted'
        }

        const newStatus = statusMap[action]

        // Update all leads
        const result = await prisma.dailyLead.updateMany({
            where: {
                id: { in: leadIds },
                trainerId: dbUser.id // Ensure user owns these leads
            },
            data: {
                status: newStatus,
                ...(action === 'contact' || action === 'contacted' ? { contactedAt: new Date() } : {})
            }
        })

        return NextResponse.json({
            success: true,
            count: result.count,
            action,
            status: newStatus
        })
    } catch (error: any) {
        console.error('Error performing bulk action:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
