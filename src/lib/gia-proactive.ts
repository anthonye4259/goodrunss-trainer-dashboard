/**
 * GIA Proactive Suggestions System
 * 
 * Analyzes trainer's data and proactively suggests actions
 * 
 * Features:
 * - Auto-detect issues (unpaid invoices, gaps in schedule, etc.)
 * - Suggest optimizations (pricing, availability, etc.)
 * - Revenue opportunities (upsell, new clients, etc.)
 * - Risk alerts (cancellations, low bookings, etc.)
 * 
 * Examples:
 * - "You have 3 unpaid invoices totaling $225. Should I send reminders?"
 * - "You're free tomorrow 2-4pm. Want me to open that slot for bookings?"
 * - "Your no-show rate increased 15% this month. Let's review your reminder strategy."
 */

import { prisma } from "./prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ProactiveSuggestion {
  id: string;
  type: 'action' | 'warning' | 'opportunity' | 'insight';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  action?: {
    label: string;
    endpoint: string;
    params: Record<string, any>;
  };
  data?: Record<string, any>;
  createdAt: Date;
}

/**
 * Generate proactive suggestions for a trainer
 */
export async function generateProactiveSuggestions(trainerId: string): Promise<ProactiveSuggestion[]> {
  try {
    console.log(`🤖 Generating proactive suggestions for trainer ${trainerId}...`);

    // Fetch trainer's specialty for tailored suggestions
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: {
        specialties: true,
        name: true,
      },
    });

    const specialties = trainer?.specialties || [];
    const primarySpecialty = specialties[0] || 'fitness';

    // Gather all relevant data
    const [
      unpaidInvoices,
      upcomingBookings,
      recentCancellations,
      clientActivity,
      revenueData,
      availabilityGaps,
    ] = await Promise.all([
      analyzeUnpaidInvoices(trainerId),
      analyzeUpcomingBookings(trainerId),
      analyzeRecentCancellations(trainerId),
      analyzeClientActivity(trainerId),
      analyzeRevenue(trainerId),
      analyzeAvailabilityGaps(trainerId),
    ]);

    const suggestions: ProactiveSuggestion[] = [];

    // Get specialty-specific terminology
    const terminology = getSpecialtyTerminology(primarySpecialty);

    // 1. Unpaid Invoices
    if (unpaidInvoices.count > 0) {
      suggestions.push({
        id: `unpaid-${Date.now()}`,
        type: 'action',
        priority: unpaidInvoices.totalAmount > 500 ? 'high' : 'medium',
        title: 'Unpaid Invoices',
        message: `You have ${unpaidInvoices.count} unpaid invoices totaling $${unpaidInvoices.totalAmount.toFixed(2)}. Should I send payment reminders?`,
        action: {
          label: 'Send Reminders',
          endpoint: '/api/gia/actions/send-payment-reminders',
          params: { invoiceIds: unpaidInvoices.ids },
        },
        data: unpaidInvoices,
        createdAt: new Date(),
      });
    }

    // 2. Availability Gaps
    if (availabilityGaps.gaps.length > 0) {
      const nextGap = availabilityGaps.gaps[0];
      suggestions.push({
        id: `availability-${Date.now()}`,
        type: 'opportunity',
        priority: 'low',
        title: 'Open Time Slots',
        message: `You're free ${nextGap.date} from ${nextGap.startTime} to ${nextGap.endTime}. Want me to open this slot for bookings?`,
        action: {
          label: 'Open Slot',
          endpoint: '/api/gia/actions/open-availability',
          params: { date: nextGap.date, startTime: nextGap.startTime, endTime: nextGap.endTime },
        },
        data: availabilityGaps,
        createdAt: new Date(),
      });
    }

    // 3. Booking Reminders (specialty-aware)
    if (upcomingBookings.withoutReminders > 0) {
      suggestions.push({
        id: `reminders-${Date.now()}`,
        type: 'action',
        priority: 'medium',
        title: `${terminology.session} Reminders`,
        message: `${upcomingBookings.withoutReminders} upcoming ${terminology.sessionPlural} don't have reminders set. Should I schedule them now?`,
        action: {
          label: 'Schedule Reminders',
          endpoint: '/api/gia/actions/schedule-reminders',
          params: { bookingIds: upcomingBookings.idsWithoutReminders },
        },
        data: upcomingBookings,
        createdAt: new Date(),
      });
    }

    // 4. Recent Cancellations
    if (recentCancellations.rate > 0.15) { // >15% cancellation rate
      suggestions.push({
        id: `cancellations-${Date.now()}`,
        type: 'warning',
        priority: 'high',
        title: 'High Cancellation Rate',
        message: `Your cancellation rate increased to ${(recentCancellations.rate * 100).toFixed(1)}% this month (up ${recentCancellations.increase}% from last month). Let's review your reminder strategy.`,
        action: {
          label: 'Review Strategy',
          endpoint: '/api/gia/actions/review-cancellations',
          params: { data: recentCancellations },
        },
        data: recentCancellations,
        createdAt: new Date(),
      });
    }

    // 5. Inactive Clients
    if (clientActivity.inactiveCount > 0) {
      suggestions.push({
        id: `inactive-${Date.now()}`,
        type: 'opportunity',
        priority: 'medium',
        title: 'Inactive Clients',
        message: `${clientActivity.inactiveCount} clients haven't booked in over 30 days. Should I send them a re-engagement message?`,
        action: {
          label: 'Re-engage Clients',
          endpoint: '/api/gia/actions/reengage-clients',
          params: { clientIds: clientActivity.inactiveClientIds },
        },
        data: clientActivity,
        createdAt: new Date(),
      });
    }

    // 6. Revenue Insights
    if (revenueData.trend === 'declining') {
      suggestions.push({
        id: `revenue-${Date.now()}`,
        type: 'warning',
        priority: 'high',
        title: 'Revenue Declining',
        message: `Your revenue is down ${revenueData.percentChange}% from last month. I've identified ${revenueData.opportunities.length} opportunities to increase bookings.`,
        action: {
          label: 'View Opportunities',
          endpoint: '/api/gia/actions/revenue-opportunities',
          params: { data: revenueData },
        },
        data: revenueData,
        createdAt: new Date(),
      });
    }

    // 7. Pricing Optimization
    if (revenueData.demandHigh && revenueData.currentRate < revenueData.marketRate * 0.9) {
      suggestions.push({
        id: `pricing-${Date.now()}`,
        type: 'opportunity',
        priority: 'medium',
        title: 'Pricing Opportunity',
        message: `Your sessions are booking quickly (${revenueData.bookingRate}% occupancy). You could increase your rate from $${revenueData.currentRate} to $${revenueData.suggestedRate} based on market demand.`,
        action: {
          label: 'Review Pricing',
          endpoint: '/api/gia/actions/review-pricing',
          params: { currentRate: revenueData.currentRate, suggestedRate: revenueData.suggestedRate },
        },
        data: revenueData,
        createdAt: new Date(),
      });
    }

    console.log(`✅ Generated ${suggestions.length} proactive suggestions`);

    return suggestions;

  } catch (error: any) {
    console.error("❌ Error generating proactive suggestions:", error);
    throw error;
  }
}

/**
 * Analyze unpaid invoices
 */
async function analyzeUnpaidInvoices(trainerId: string) {
  const unpaidInvoices = await prisma.payment.findMany({
    where: {
      trainerId,
      status: 'pending',
      dueDate: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
      amount: true,
      dueDate: true,
      client: {
        select: { name: true, email: true },
      },
    },
  });

  return {
    count: unpaidInvoices.length,
    totalAmount: unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    ids: unpaidInvoices.map(inv => inv.id),
    details: unpaidInvoices,
  };
}

/**
 * Analyze upcoming bookings
 */
async function analyzeUpcomingBookings(trainerId: string) {
  const upcomingBookings = await prisma.trainerSession.findMany({
    where: {
      trainerId,
      date: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
      status: 'scheduled',
    },
    include: {
      client: {
        select: { name: true },
      },
    },
  });

  const withoutReminders = upcomingBookings.filter(booking => {
    // Check if reminder was sent (you'd need a reminders table)
    // For now, assume if booking is within 24h and no reminder, flag it
    const hoursUntil = (booking.date.getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursUntil < 24;
  });

  return {
    total: upcomingBookings.length,
    withoutReminders: withoutReminders.length,
    idsWithoutReminders: withoutReminders.map(b => b.id),
  };
}

/**
 * Analyze recent cancellations
 */
async function analyzeRecentCancellations(trainerId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [recentCancellations, previousCancellations, recentTotal, previousTotal] = await Promise.all([
    prisma.trainerSession.count({
      where: { trainerId, status: 'cancelled', date: { gte: thirtyDaysAgo } },
    }),
    prisma.trainerSession.count({
      where: { trainerId, status: 'cancelled', date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.trainerSession.count({
      where: { trainerId, date: { gte: thirtyDaysAgo } },
    }),
    prisma.trainerSession.count({
      where: { trainerId, date: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
  ]);

  const recentRate = recentTotal > 0 ? recentCancellations / recentTotal : 0;
  const previousRate = previousTotal > 0 ? previousCancellations / previousTotal : 0;
  const increase = previousRate > 0 ? ((recentRate - previousRate) / previousRate) * 100 : 0;

  return {
    rate: recentRate,
    previousRate,
    increase: increase.toFixed(1),
    count: recentCancellations,
  };
}

/**
 * Analyze client activity
 */
async function analyzeClientActivity(trainerId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const allClients = await prisma.client.findMany({
    where: { trainerId },
    include: {
      sessions: {
        where: { date: { gte: thirtyDaysAgo } },
        select: { id: true },
      },
    },
  });

  const inactiveClients = allClients.filter(client => client.sessions.length === 0);

  return {
    totalClients: allClients.length,
    activeClients: allClients.length - inactiveClients.length,
    inactiveCount: inactiveClients.length,
    inactiveClientIds: inactiveClients.map(c => c.id),
  };
}

/**
 * Analyze revenue trends
 */
async function analyzeRevenue(trainerId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonthRevenue, lastMonthRevenue, totalSessions, completedSessions] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        trainerId,
        status: 'completed',
        paidAt: { gte: thisMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        trainerId,
        status: 'completed',
        paidAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
      _sum: { amount: true },
    }),
    prisma.trainerSession.count({
      where: { trainerId, date: { gte: thisMonthStart } },
    }),
    prisma.trainerSession.count({
      where: { trainerId, date: { gte: thisMonthStart }, status: 'completed' },
    }),
  ]);

  const thisMonth = thisMonthRevenue._sum.amount || 0;
  const lastMonth = lastMonthRevenue._sum.amount || 0;
  const percentChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
  const trend = percentChange > 5 ? 'growing' : percentChange < -5 ? 'declining' : 'stable';

  // Get trainer's current rate
  const trainer = await prisma.user.findUnique({
    where: { id: trainerId },
    select: { hourlyRate: true },
  });

  const bookingRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return {
    thisMonth,
    lastMonth,
    percentChange: percentChange.toFixed(1),
    trend,
    opportunities: [],
    demandHigh: bookingRate > 80,
    bookingRate,
    currentRate: trainer?.hourlyRate || 0,
    marketRate: 100, // Would come from market data
    suggestedRate: (trainer?.hourlyRate || 0) * 1.15,
  };
}

/**
 * Analyze availability gaps
 */
async function analyzeAvailabilityGaps(trainerId: string) {
  // This would analyze the trainer's calendar for gaps
  // For now, return mock data
  return {
    gaps: [
      {
        date: 'tomorrow',
        startTime: '2:00 PM',
        endTime: '4:00 PM',
      },
    ],
  };
}

/**
 * Get AI-powered suggestion using Claude
 */
export async function getAISuggestion(context: {
  trainerData: any;
  recentActivity: any;
  goals?: string[];
}): Promise<string> {
  try {
    const prompt = `You are GIA, an AI assistant for fitness trainers. Analyze this trainer's data and provide one actionable, specific suggestion to improve their business.

Trainer Data:
${JSON.stringify(context.trainerData, null, 2)}

Recent Activity:
${JSON.stringify(context.recentActivity, null, 2)}

Goals:
${context.goals?.join(', ') || 'Increase revenue, improve client retention'}

Provide a single, specific, actionable suggestion in 1-2 sentences. Be conversational and supportive.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const suggestion = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'No suggestion available';

    return suggestion;

  } catch (error: any) {
    console.error("❌ Error getting AI suggestion:", error);
    return "I'm analyzing your data and will have suggestions for you soon.";
  }
}

/**
 * Get specialty-specific terminology for proactive suggestions
 */
function getSpecialtyTerminology(specialty: string): {
  session: string;
  sessionPlural: string;
  client: string;
  clientPlural: string;
} {
  const terminology: Record<string, any> = {
    basketball: {
      session: 'Practice',
      sessionPlural: 'practices',
      client: 'player',
      clientPlural: 'players',
    },
    pickleball: {
      session: 'Practice',
      sessionPlural: 'practices',
      client: 'player',
      clientPlural: 'players',
    },
    tennis: {
      session: 'Practice',
      sessionPlural: 'practices',
      client: 'player',
      clientPlural: 'players',
    },
    yoga: {
      session: 'Class',
      sessionPlural: 'classes',
      client: 'student',
      clientPlural: 'students',
    },
    pilates: {
      session: 'Class',
      sessionPlural: 'classes',
      client: 'client',
      clientPlural: 'clients',
    },
    barre: {
      session: 'Class',
      sessionPlural: 'classes',
      client: 'student',
      clientPlural: 'students',
    },
    martial_arts: {
      session: 'Class',
      sessionPlural: 'classes',
      client: 'student',
      clientPlural: 'students',
    },
    boxing: {
      session: 'Training Session',
      sessionPlural: 'training sessions',
      client: 'fighter',
      clientPlural: 'fighters',
    },
    dance: {
      session: 'Class',
      sessionPlural: 'classes',
      client: 'dancer',
      clientPlural: 'dancers',
    },
    soccer: {
      session: 'Practice',
      sessionPlural: 'practices',
      client: 'player',
      clientPlural: 'players',
    },
    volleyball: {
      session: 'Practice',
      sessionPlural: 'practices',
      client: 'player',
      clientPlural: 'players',
    },
    golf: {
      session: 'Lesson',
      sessionPlural: 'lessons',
      client: 'golfer',
      clientPlural: 'golfers',
    },
    crossfit: {
      session: 'WOD',
      sessionPlural: 'WODs',
      client: 'athlete',
      clientPlural: 'athletes',
    },
    running: {
      session: 'Run',
      sessionPlural: 'runs',
      client: 'runner',
      clientPlural: 'runners',
    },
    cycling: {
      session: 'Ride',
      sessionPlural: 'rides',
      client: 'cyclist',
      clientPlural: 'cyclists',
    },
    swimming: {
      session: 'Swim',
      sessionPlural: 'swims',
      client: 'swimmer',
      clientPlural: 'swimmers',
    },
  };

  const normalizedSpecialty = specialty.toLowerCase().replace(/[_\s-]+/g, '_');
  return terminology[normalizedSpecialty] || {
    session: 'Session',
    sessionPlural: 'sessions',
    client: 'client',
    clientPlural: 'clients',
  };
}

