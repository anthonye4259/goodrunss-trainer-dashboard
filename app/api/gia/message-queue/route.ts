import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import prisma from '@/lib/prisma'

// In-memory queue for now (would be a database table in production)
let messageQueue: any[] = [
    {
        id: 'draft_1',
        recipientId: 'client_1',
        recipientName: 'Jessica Chen',
        message: "Hi Jessica! Just checking in to see how you're feeling after yesterday's session. Remember to stretch!",
        type: 'check_in',
        status: 'draft',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        channel: 'sms'
    },
    {
        id: 'draft_2',
        recipientId: 'client_3',
        recipientName: 'Sarah Johnson',
        message: "Happy Birthday Sarah! 🎉 Hope you have a wonderful day. Enjoy your free birthday session this week!",
        type: 'birthday',
        status: 'draft',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        channel: 'sms'
    }
]

export async function GET(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()

        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({
            queue: messageQueue
        })

    } catch (error: any) {
        console.error('Error fetching message queue:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch queue' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()

        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { recipientId, recipientName, message, type, channel } = body

        const newDraft = {
            id: `draft_${Date.now()}`,
            recipientId,
            recipientName,
            message,
            type: type || 'general',
            status: 'draft',
            createdAt: new Date().toISOString(),
            channel: channel || 'sms'
        }

        messageQueue.unshift(newDraft)

        return NextResponse.json({
            success: true,
            draft: newDraft
        })

    } catch (error: any) {
        console.error('Error creating draft:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create draft' },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()

        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        messageQueue = messageQueue.filter(m => m.id !== id)

        return NextResponse.json({
            success: true,
            message: 'Draft deleted'
        })

    } catch (error: any) {
        console.error('Error deleting draft:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to delete draft' },
            { status: 500 }
        )
    }
}
