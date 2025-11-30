import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const twilio = require('twilio');

/**
 * GET/POST /api/cron/send-reminders
 * Automated session reminders (call via cron job)
 * Sends reminders 24hrs and 1hr before sessions
 */
export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000); // Buffer
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Buffer

    // Find sessions in the next 24-25 hours (for 24hr reminders)
    const sessions24hr = await prisma.trainerSession.findMany({
      where: {
        scheduledAt: {
          gte: in24Hours,
          lte: in25Hours
        },
        status: 'SCHEDULED'
      },
      include: {
        client: true
      }
    });

    // Find sessions in the next 1-2 hours (for 1hr reminders)
    const sessions1hr = await prisma.trainerSession.findMany({
      where: {
        scheduledAt: {
          gte: in1Hour,
          lte: in2Hours
        },
        status: 'SCHEDULED'
      },
      include: {
        client: true
      }
    });

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    let sent24hr = 0;
    let sent1hr = 0;
    const errors: string[] = [];

    // Send 24-hour reminders
    for (const session of sessions24hr) {
      try {
        if (!session.client?.phone) continue;

        const message = `Hi ${session.client.name}! Reminder: You have a ${session.title || 'training'} session tomorrow at ${formatTime(session.scheduledAt)}. See you there! 💪`;

        const phone = formatPhone(session.client.phone);

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        // Mark as sent (update notes field since we don't have metadata)
        await prisma.trainerSession.update({
          where: { id: session.id },
          data: {
            notes: `${session.notes || ''}\n[Reminder sent: 24hr at ${now.toISOString()}]`
          }
        });

        sent24hr++;
      } catch (error: any) {
        console.error(`Failed to send 24hr reminder for session ${session.id}:`, error);
        errors.push(`Session ${session.id}: ${error.message}`);
      }
    }

    // Send 1-hour reminders
    for (const session of sessions1hr) {
      try {
        if (!session.client?.phone) continue;

        const message = `${session.client.name}, your ${session.title || 'training'} session is in 1 hour! Don't forget water! 💧`;

        const phone = formatPhone(session.client.phone);

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        // Mark as sent (update notes field since we don't have metadata)
        await prisma.trainerSession.update({
          where: { id: session.id },
          data: {
            notes: `${session.notes || ''}\n[Reminder sent: 1hr at ${now.toISOString()}]`
          }
        });

        sent1hr++;
      } catch (error: any) {
        console.error(`Failed to send 1hr reminder for session ${session.id}:`, error);
        errors.push(`Session ${session.id}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      stats: {
        sent24hrReminders: sent24hr,
        sent1hrReminders: sent1hr,
        totalSent: sent24hr + sent1hr,
        errors: errors.length,
        errorDetails: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error: any) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to send reminders" },
      { status: 500 }
    );
  }
}

// Helper functions
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatPhone(phone: string): string {
  // Ensure phone has country code
  if (!phone.startsWith('+')) {
    return '+1' + phone.replace(/\D/g, '');
  }
  return phone;
}

