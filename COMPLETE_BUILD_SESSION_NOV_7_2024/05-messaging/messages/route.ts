import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get messages between users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!otherUserId) {
      // Get all conversations for the user
      const conversations = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Get unique conversations
      const conversationMap = new Map()
      conversations.forEach(msg => {
        const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            user: otherUser,
            lastMessage: msg,
            unreadCount: 0
          })
        }
      })

      return NextResponse.json({
        success: true,
        conversations: Array.from(conversationMap.values())
      })
    }

    // Get messages between two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: userId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        receiverId: userId,
        senderId: otherUserId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      messages: messages
    })

  } catch (error) {
    console.error('Error getting messages:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

// POST - Send a message
export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, content, messageType, sessionId } = await req.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Sender ID, receiver ID, and content are required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        content: content,
        messageType: messageType || 'TEXT',
        sessionId: sessionId || null
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        }
      }
    })

    console.log('✅ Message sent:', message.id)

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

