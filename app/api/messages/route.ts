import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

// GET /api/messages - Get messages (conversations)
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('otherUserId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // If otherUserId is provided, get conversation with that user
    if (otherUserId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: trainer.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: trainer.id },
          ],
        },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
          receiver: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      })

      return NextResponse.json({
        success: true,
        messages,
        total: messages.length,
      })
    }

    // Otherwise, get all conversations (grouped)
    const where: any = {
      OR: [{ senderId: trainer.id }, { receiverId: trainer.id }],
    }

    if (unreadOnly) {
      where.read = false
      where.receiverId = trainer.id // Only unread messages TO the trainer
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for performance
    })

    // Group messages by conversation partner
    const conversations: Record<string, any> = {}
    messages.forEach((msg) => {
      const partnerId = msg.senderId === trainer.id ? msg.receiverId : msg.senderId
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partnerId,
          partner: msg.senderId === trainer.id ? msg.receiver : msg.sender,
          lastMessage: msg,
          unreadCount: 0,
          messages: [],
        }
      }
      if (!msg.read && msg.receiverId === trainer.id) {
        conversations[partnerId].unreadCount++
      }
    })

    return NextResponse.json({
      success: true,
      conversations: Object.values(conversations),
      total: Object.keys(conversations).length,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { receiverId, content, messageType, sessionId } = body

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: receiverId, content' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: trainer.id,
        receiverId,
        content,
        messageType: messageType || 'TEXT',
        sessionId: sessionId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PUT /api/messages - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: 'Trainer not found' }, { status: 404 })
    }

    const body = await request.json()
    const { messageIds, otherUserId } = body

    if (messageIds && Array.isArray(messageIds)) {
      // Mark specific messages as read
      await prisma.message.updateMany({
        where: {
          id: { in: messageIds },
          receiverId: trainer.id,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })
    } else if (otherUserId) {
      // Mark all messages from a user as read
      await prisma.message.updateMany({
        where: {
          senderId: otherUserId,
          receiverId: trainer.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Must provide messageIds or otherUserId' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Messages marked as read',
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}

