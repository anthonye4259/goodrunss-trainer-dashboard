import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date ranges
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get total clients count (unique emails from bookings)
    const allBookings = await prisma.publicBooking.findMany({
      where: { trainerId: userId },
      select: { clientEmail: true }
    });
    const totalClients = new Set(allBookings.map(b => b.clientEmail)).size;

    // Get clients added this month
    const bookingsThisMonth = await prisma.publicBooking.findMany({
      where: {
        trainerId: userId,
        bookedAt: { gte: startOfMonth }
      },
      select: { clientEmail: true }
    });
    const clientsThisMonth = new Set(bookingsThisMonth.map(b => b.clientEmail)).size;

    // Get sessions this week
    const sessionsThisWeek = await prisma.publicBooking.count({
      where: {
        trainerId: userId,
        startTime: { gte: startOfWeek }
      }
    });

    // Get sessions last week for comparison
    const sessionsLastWeek = await prisma.publicBooking.count({
      where: {
        trainerId: userId,
        startTime: {
          gte: startOfLastWeek,
          lt: startOfWeek
        }
      }
    });

    // Calculate revenue this month (from completed sessions)
    const sessionsThisMonth = await prisma.publicBooking.findMany({
      where: {
        trainerId: userId,
        startTime: { gte: startOfMonth },
        status: 'completed'
      },
      select: {
        price: true
      }
    });

    const revenueThisMonth = sessionsThisMonth.reduce(
      (sum, session) => sum + (session.price || 0), 
      0
    );

    // Get revenue last month for comparison
    const sessionsLastMonth = await prisma.publicBooking.findMany({
      where: {
        trainerId: userId,
        startTime: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        },
        status: 'completed'
      },
      select: {
        price: true
      }
    });

    const revenueLastMonth = sessionsLastMonth.reduce(
      (sum, session) => sum + (session.price || 0), 
      0
    );

    // Get completion rate (completed vs total sessions this week)
    const completedSessionsThisWeek = await prisma.publicBooking.count({
      where: {
        trainerId: userId,
        startTime: { gte: startOfWeek },
        status: 'completed'
      }
    });

    const completionRate = sessionsThisWeek > 0 
      ? Math.round((completedSessionsThisWeek / sessionsThisWeek) * 100) 
      : 0;

    // Get last week's completion rate
    const completedSessionsLastWeek = await prisma.publicBooking.count({
      where: {
        trainerId: userId,
        startTime: {
          gte: startOfLastWeek,
          lt: startOfWeek
        },
        status: 'completed'
      }
    });

    const completionRateLastWeek = sessionsLastWeek > 0 
      ? Math.round((completedSessionsLastWeek / sessionsLastWeek) * 100) 
      : 0;

    // Get revenue by day for the last 7 days (for chart)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const revenueByDay = await Promise.all(
      last7Days.map(async (date, index) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const sessions = await prisma.publicBooking.findMany({
          where: {
            trainerId: userId,
            startTime: {
              gte: date,
              lt: nextDay
            },
            status: 'completed'
          },
          select: {
            price: true
          }
        });

        const dayRevenue = sessions.reduce((sum, s) => sum + (s.price || 0), 0);

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
          day: dayNames[date.getDay()],
          amount: dayRevenue
        };
      })
    );

    // Get sessions by day for the last 7 days (for chart)
    const sessionsByDay = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.publicBooking.count({
          where: {
            trainerId: userId,
            startTime: {
              gte: date,
              lt: nextDay
            }
          }
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return {
          day: dayNames[date.getDay()],
          sessions: count
        };
      })
    );

    // Calculate percentage changes
    const sessionsChange = sessionsLastWeek > 0
      ? Math.round(((sessionsThisWeek - sessionsLastWeek) / sessionsLastWeek) * 100)
      : 0;

    const revenueChange = revenueLastMonth > 0
      ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100)
      : 0;

    const completionRateChange = completionRate - completionRateLastWeek;

    return NextResponse.json({
      success: true,
      stats: {
        totalClients,
        clientsThisMonth,
        sessionsThisWeek,
        sessionsChange,
        revenueThisMonth,
        revenueChange,
        completionRate,
        completionRateChange,
      },
      charts: {
        revenueByDay,
        sessionsByDay
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

