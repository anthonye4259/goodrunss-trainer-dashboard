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
      console.log(`[ADMIN API] Access denied for ${email}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get all users from DB
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { 
            client: true,
            trainerSessions: true
          }
        }
      }
    })

    return NextResponse.json({ users: dbUsers })
  } catch (error: any) {
    console.error('[ADMIN API] Error fetching users:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 })
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
      console.log(`[ADMIN API] Sync denied for ${email}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'sync_clerk') {
      console.log('[ADMIN API] Starting Clerk Sync...')
      
      // Fetch latest users from Clerk
      const client = await clerkClient()
      const clerkUsers = await client.users.getUserList({ limit: 100 })
      
      console.log(`[ADMIN API] Found ${clerkUsers.data.length} users in Clerk`)
      
      const syncedUsers = []
      
      for (const clerkUser of clerkUsers.data) {
        const email = clerkUser.emailAddresses[0]?.emailAddress
        const name = clerkUser.firstName 
          ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
          : clerkUser.username || email?.split('@')[0] || 'Trainer'

        // Upsert user in DB
        const dbUser = await prisma.user.upsert({
          where: { id: clerkUser.id },
          update: {
            email: email || '',
            name: name,
            image: clerkUser.imageUrl,
            updatedAt: new Date(),
          },
          create: {
            id: crypto.randomUUID(),
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

      console.log(`[ADMIN API] Successfully synced ${syncedUsers.length} users`)

      return NextResponse.json({ 
        success: true, 
        count: syncedUsers.length,
        users: syncedUsers 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('[ADMIN API] Error syncing users:', error)
    console.error(error.stack)
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 })
  }
}
