import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { currentUser } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    // Security Check
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = user.emailAddresses[0]?.emailAddress
    const isAdmin = email === 'anthony@goodrunss.com' || email === 'anthonyedwards@goodrunss.com'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get total trainers
    const totalTrainers = await prisma.users.count({
      where: { role: 'TRAINER' },
    })

    // Get trainers created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const newTrainersThisMonth = await prisma.users.count({
      where: {
        role: 'TRAINER',
        createdAt: { gte: startOfMonth },
      },
    })

    // Get active subscriptions
    const activeSubscriptions = await prisma.user_subscriptions.count({
      where: { status: 'active' },
    })

    // Get trial subscriptions
    const trialSubscriptions = await prisma.user_subscriptions.count({
      where: { status: 'trialing' },
    })

    // Calculate MRR (Monthly Recurring Revenue)
    const subscriptions = await prisma.user_subscriptions.findMany({
      where: { status: { in: ['active', 'trialing'] } },
    })

    let mrr = 0
    subscriptions.forEach(sub => {
      // Extract price from plan name (e.g., "$75 - 6 Month Plan")
      const match = sub.planName.match(/\$(\d+)/)
      if (match) {
        const amount = parseFloat(match[1])
        // Convert to monthly (assuming 6-month and 1-year plans)
        if (sub.planName.includes('6 Month')) {
          mrr += amount / 6
        } else if (sub.planName.includes('1 Year') || sub.planName.includes('1-Year')) {
          mrr += amount / 12
        } else {
          mrr += amount
        }
      }
    })

    // Get recent signups (last 10)
    const recentSignups = await prisma.user_subscriptions.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription_plans: {
          select: { name: true },
        },
      },
    })

    const recentSignupsWithNames = await Promise.all(
      recentSignups.map(async (signup) => {
        const user = await prisma.users.findFirst({
          where: { clerkId: signup.userId },
          select: { name: true, email: true },
        })
        return {
          id: signup.id,
          name: user?.name,
          email: signup.userEmail,
          plan: signup.planName,
          createdAt: signup.createdAt,
        }
      })
    )

    // Failed payments (could be expanded with Stripe API)
    const failedPayments = 0

    return NextResponse.json({
      totalTrainers,
      newTrainersThisMonth,
      activeSubscriptions,
      trialSubscriptions,
      mrr,
      failedPayments,
      recentSignups: recentSignupsWithNames,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
