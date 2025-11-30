import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get all active subscriptions
    const subscriptions = await prisma.userSubscription.findMany({
      where: { status: { in: ['active', 'trialing'] } },
    })

    // Calculate MRR (Monthly Recurring Revenue)
    let mrr = 0
    const planBreakdown: any[] = []
    const planMap = new Map<string, { count: number; revenue: number }>()

    subscriptions.forEach(sub => {
      // Extract price from plan name
      const match = sub.planName.match(/\$(\d+)/)
      if (match) {
        const amount = parseFloat(match[1])
        let monthlyAmount = 0

        // Convert to monthly
        if (sub.planName.includes('6 Month')) {
          monthlyAmount = amount / 6
        } else if (sub.planName.includes('1 Year') || sub.planName.includes('1-Year')) {
          monthlyAmount = amount / 12
        } else if (sub.planName.includes('3 Month')) {
          monthlyAmount = amount / 3
        } else if (!sub.planName.includes('Free')) {
          monthlyAmount = amount
        }

        mrr += monthlyAmount

        // Update plan breakdown
        const existing = planMap.get(sub.planName) || { count: 0, revenue: 0 }
        planMap.set(sub.planName, {
          count: existing.count + 1,
          revenue: existing.revenue + monthlyAmount,
        })
      }
    })

    // Convert plan map to array
    planMap.forEach((value, key) => {
      planBreakdown.push({
        plan: key,
        count: value.count,
        revenue: value.revenue,
      })
    })

    // Calculate ARR (Annual Recurring Revenue)
    const arr = mrr * 12

    // Get paying customers (exclude free accounts)
    const payingCustomers = await prisma.userSubscription.count({
      where: {
        status: 'active',
        planName: { not: { contains: 'Free' } },
      },
    })

    // Calculate churn rate (simplified - cancelled in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const cancelledCount = await prisma.userSubscription.count({
      where: {
        status: 'canceled',
        canceledAt: { gte: thirtyDaysAgo },
      },
    })

    const totalActiveThirtyDaysAgo = payingCustomers + cancelledCount
    const churnRate = totalActiveThirtyDaysAgo > 0 
      ? (cancelledCount / totalActiveThirtyDaysAgo) * 100 
      : 0

    // Get recent transactions
    const recentTransactions = await prisma.userSubscription.findMany({
      where: { status: { in: ['active', 'trialing'] } },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    const recentTransactionsWithNames = await Promise.all(
      recentTransactions.map(async (trans) => {
        const user = await prisma.user.findFirst({
          where: { id: trans.userId },
          select: { name: true },
        })

        const match = trans.planName.match(/\$(\d+)/)
        const amount = match ? parseFloat(match[1]) : 0

        return {
          id: trans.id,
          trainerName: user?.name,
          plan: trans.planName,
          amount,
          status: trans.status,
          date: trans.createdAt,
        }
      })
    )

    // Get active trials
    const activeTrials = await prisma.userSubscription.count({
      where: { status: 'trialing' },
    })

    // Calculate trial conversion rate (simplified)
    const completedTrials = await prisma.userSubscription.count({
      where: {
        status: 'active',
        trialEnd: { not: null },
      },
    })

    const totalTrials = activeTrials + completedTrials
    const trialConversionRate = totalTrials > 0 
      ? (completedTrials / totalTrials) * 100 
      : 0

    // Calculate ARPU (Average Revenue Per User)
    const arpu = payingCustomers > 0 ? mrr / payingCustomers : 0

    // Calculate LTV (Lifetime Value) - simplified: ARPU * average lifetime in months
    // Assuming average lifetime of 12 months
    const ltv = arpu * 12

    return NextResponse.json({
      mrr,
      arr,
      payingCustomers,
      churnRate,
      planBreakdown,
      recentTransactions: recentTransactionsWithNames,
      activeTrials,
      trialConversionRate,
      arpu,
      ltv,
    })
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}

