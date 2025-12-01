import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser } from '@/lib/get-or-create-user'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const dbUser = await getOrCreateUser()

        if (!dbUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // In a real app, we would query the messages table
        // For now, we'll return mock data combined with any real SMS messages if we have them

        // Mock conversations
        const mockConversations = [
            {
                id: 'conv_1',
                clientId: 'client_1',
                clientName: 'Jessica Chen',
                clientAvatar: '/avatars/jessica.jpg',
                lastMessage: {
                    id: 'msg_1',
                    content: "That sounds great! I'm free Tuesday at 10am.",
                    sender: 'client',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
                    read: false,
                    channel: 'sms'
                },
                unreadCount: 1
            },
            {
                id: 'conv_2',
                clientId: 'client_2',
                clientName: 'Marcus Williams',
                clientAvatar: '/avatars/marcus.jpg',
                lastMessage: {
                    id: 'msg_2',
                    content: "Hey Marcus, just checking in on your practice swings.",
                    sender: 'trainer',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    read: true,
                    channel: 'sms'
                },
                unreadCount: 0
            },
            {
                id: 'conv_3',
                clientId: 'client_3',
                clientName: 'Sarah Johnson',
                clientAvatar: '/avatars/sarah.jpg',
                lastMessage: {
                    id: 'msg_3',
                    content: "Can we reschedule for next week?",
                    sender: 'client',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    read: false,
                    channel: 'email'
                },
                unreadCount: 1
            }
        ]

        return NextResponse.json({
            conversations: mockConversations
        })

    } catch (error: any) {
        console.error('Error fetching inbox:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch inbox' },
            { status: 500 }
        )
    }
}
