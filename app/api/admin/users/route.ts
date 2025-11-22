import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    // Security Check
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    const isAdmin = email === 'anthony@goodrunss.com' || 
                   email === 'anthonyedwards@goodrunss.com' || 
                   email === 'anthonye@andrew.cmu.edu'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users from DB
    const dbUsers = await prisma.users.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { 
            clients: true,
            trainer_sessions_trainer_sessions_trainerIdTousers: true
          }
        }
      }
    })

    return NextResponse.json({ users: dbUsers })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security Check
    const user = await currentUser()
    const email = user?.emailAddresses[0]?.emailAddress
    const isAdmin = email === 'anthony@goodrunss.com' || 
                   email === 'anthonyedwards@goodrunss.com' || 
                   email === 'anthonye@andrew.cmu.edu'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'sync_clerk') {
      // Fetch latest users from Clerk
      const clerkUsers = await (await clerkClient()).users.getUserList({ limit: 100 })
      
      const syncedUsers = []
      
      for (const clerkUser of clerkUsers.data) {
        const email = clerkUser.emailAddresses[0]?.emailAddress
        const name = clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : clerkUser.username || email?.split('@')[0] || 'Trainer'

        // Upsert user in DB
        const dbUser = await prisma.users.upsert({
          where: { clerkId: clerkUser.id },
          update: {
            email: email || '',
            name: name,
            image: clerkUser.imageUrl,
            updatedAt: new Date(),
          },
          create: {
            id: crypto.randomUUID(),
            clerkId: clerkUser.id,
            email: email || '',
            name: name,
            image: clerkUser.imageUrl,
            role: 'TRAINER',
            emailVerified: new Date(),
            updatedAt: new Date(),
          }
        })
        syncedUsers.push(dbUser)
      }

      return NextResponse.json({ 
        success: true, 
        count: syncedUsers.length,
        users: syncedUsers 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error syncing users:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

