import { NextResponse } from 'next/server'
// import { auth } from '@clerk/nextjs/server' // TODO: Enable auth after setup
// import { prisma } from '@/lib/db' // TODO: Enable after first deploy

export async function GET() {
  try {
    // TODO: Enable auth after Clerk setup
    // const { userId } = await auth()
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    const userId = 'demo-user' // Temporary for testing

    // TEMPORARY: Return mock data for first deploy
    // TODO: Replace with real database queries after successful deployment
    const mockTrainer = {
      id: userId,
      name: 'Coach',
      rating: 4.7,
      totalSessions: 0
    }

    // TEMPORARY: Mock data for first deploy
    const thisMonthRevenue = 0
    const lastMonthRevenue = 0
    const revenueChange = 0
    const totalClients = 0
    const atRiskClients: any[] = []
    const overduePayments: any[] = []
    const overdueTotal = 0
    const sessionsThisWeek = 0
    const completedSessionsThisWeek = 0
    const clientLTV = 0
    const churnRate = 0
    const activeReferrals = 0
    const referralStats: any[] = []

    return NextResponse.json({
      trainer: {
        name: mockTrainer.name,
        rating: mockTrainer.rating,
        totalSessions: mockTrainer.totalSessions
      },
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        change: revenueChange,
        forecast: thisMonthRevenue * 1.14 // 14% projected growth
      },
      clients: {
        total: totalClients,
        atRisk: atRiskClients.length,
        atRiskList: atRiskClients,
        highEngagement: Math.floor(totalClients * 0.68),
        mediumEngagement: Math.floor(totalClients * 0.24),
        ltv: clientLTV
      },
      payments: {
        overdue: overduePayments.length,
        overdueTotal: overdueTotal,
        overdueList: overduePayments
      },
      sessions: {
        thisWeek: sessionsThisWeek,
        completed: completedSessionsThisWeek,
        utilization: sessionsThisWeek > 0 ? (completedSessionsThisWeek / sessionsThisWeek) * 100 : 0
      },
      churn: {
        rate: churnRate,
        previousRate: churnRate - 0.8 // Mock previous rate
      },
      referrals: {
        totalInvites: referralStats.length,
        activeReferrals: activeReferrals,
        creditsEarned: activeReferrals * 10, // $10 per referral
        freeMonthsEarned: Math.floor(activeReferrals / 3)
      }
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

