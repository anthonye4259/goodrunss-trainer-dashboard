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
    const sessions24hr = await prisma.session.findMany({
      where: {
        startTime: {
          gte: in24Hours,
          lte: in25Hours
        },
        status: 'SCHEDULED',
        // Don't send if already sent
        metadata: {
          path: ['reminder24hrSent'],
          equals: undefined as any
        }
      },
      include: {
        client: true,
        trainer: true
      }
    });

    // Find sessions in the next 1-2 hours (for 1hr reminders)
    const sessions1hr = await prisma.session.findMany({
      where: {
        startTime: {
          gte: in1Hour,
          lte: in2Hours
        },
        status: 'SCHEDULED',
        metadata: {
          path: ['reminder1hrSent'],
          equals: undefined as any
        }
      },
      include: {
        client: true,
        trainer: true
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
        if (!session.client.phone) continue;

        const message = `Hi ${session.client.name}! Reminder: You have a ${session.sessionType || 'training'} session with ${session.trainer.name} tomorrow at ${formatTime(session.startTime)}. See you there! 💪`;

        const phone = formatPhone(session.client.phone);
        
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        // Mark as sent
        await prisma.session.update({
          where: { id: session.id },
          data: {
            metadata: {
              ...(session.metadata as any || {}),
              reminder24hrSent: true,
              reminder24hrSentAt: now.toISOString()
            }
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
        if (!session.client.phone) continue;

        const message = `${session.client.name}, your ${session.sessionType || 'training'} session with ${session.trainer.name} is in 1 hour! ${session.location ? `Location: ${session.location}` : ''} Don't forget water! 💧`;

        const phone = formatPhone(session.client.phone);
        
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        // Mark as sent
        await prisma.session.update({
          where: { id: session.id },
          data: {
            metadata: {
              ...(session.metadata as any || {}),
              reminder1hrSent: true,
              reminder1hrSentAt: now.toISOString()
            }
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

