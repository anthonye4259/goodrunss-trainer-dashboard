import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/retention
 * Get retention alerts for trainer's clients
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const severity = url.searchParams.get("severity");
    const dismissed = url.searchParams.get("dismissed") === 'true';

    let whereClause = `WHERE trainer_id = '${user.id}' AND is_dismissed = ${dismissed}`;
    if (severity) whereClause += ` AND severity = '${severity}'`;

    const alerts = await prisma.$queryRawUnsafe(`
      SELECT r.*, u.name as client_name, u.email as client_email
      FROM retention_alerts r
      JOIN users u ON r.client_id = u.id
      ${whereClause}
      ORDER BY 
        CASE severity
          WHEN 'critical' THEN 1
          WHEN 'warning' THEN 2
          WHEN 'info' THEN 3
        END,
        r.created_at DESC
    `);

    return NextResponse.json({ success: true, alerts });
  } catch (error: any) {
    console.error("❌ Error fetching retention alerts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch retention alerts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/retention/calculate
 * Calculate health scores and generate alerts for all clients
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all clients for this trainer (from both legacy Client table and User table)
    const clients: any = await prisma.$queryRaw`
      SELECT u.id, u.name, u.email,
        (SELECT COUNT(*) FROM trainer_sessions WHERE app_client_id = u.id AND status = 'COMPLETED') as total_sessions,
        (SELECT MAX(scheduled_at) FROM trainer_sessions WHERE app_client_id = u.id) as last_session_date
      FROM users u
      WHERE u.role = 'CLIENT'
      AND EXISTS (SELECT 1 FROM trainer_sessions WHERE app_client_id = u.id AND trainer_id = ${user.id})
    `;

    const alertsCreated = [];

    for (const client of clients) {
      const daysSinceLastSession = client.last_session_date 
        ? Math.floor((Date.now() - new Date(client.last_session_date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Calculate health score (simple version)
      let healthScore = 100;
      let churnRisk = 'low';
      let alertsForClient = [];

      // Alert: No session in 2+ weeks
      if (daysSinceLastSession >= 14 && daysSinceLastSession < 30) {
        healthScore -= 30;
        churnRisk = 'medium';
        alertsForClient.push({
          type: 'no_session_2weeks',
          severity: 'warning',
          message: `${client.name} hasn't booked in ${daysSinceLastSession} days`,
          action: 'Send check-in message or discount offer'
        });
      }

      // Alert: No session in 30+ days (critical)
      if (daysSinceLastSession >= 30) {
        healthScore -= 60;
        churnRisk = 'high';
        alertsForClient.push({
          type: 'no_session_30days',
          severity: 'critical',
          message: `${client.name} hasn't booked in ${daysSinceLastSession} days - HIGH CHURN RISK`,
          action: 'Urgent: Call or send personalized re-engagement offer'
        });
      }

      // Create/update health score
      await prisma.$queryRawUnsafe(`
        INSERT INTO client_health_scores (
          client_id, trainer_id, health_score, days_since_last_session, 
          churn_risk, last_calculated_at
        ) VALUES (
          '${client.id}', '${user.id}', ${healthScore}, ${daysSinceLastSession},
          '${churnRisk}', NOW()
        )
        ON CONFLICT (client_id, trainer_id) 
        DO UPDATE SET 
          health_score = ${healthScore},
          days_since_last_session = ${daysSinceLastSession},
          churn_risk = '${churnRisk}',
          last_calculated_at = NOW()
      `);

      // Create alerts
      for (const alert of alertsForClient) {
        await prisma.$queryRawUnsafe(`
          INSERT INTO retention_alerts (
            trainer_id, client_id, alert_type, severity, message, action_suggested
          ) VALUES (
            '${user.id}', '${client.id}', '${alert.type}', '${alert.severity}',
            '${alert.message}', '${alert.action}'
          )
        `);
        alertsCreated.push(alert);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Analyzed ${clients.length} clients, created ${alertsCreated.length} alerts`,
      alertsCreated,
    });
  } catch (error: any) {
    console.error("❌ Error calculating retention:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate retention" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/retention
 * Dismiss alert
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 });
    }

    await prisma.$queryRaw`
      UPDATE retention_alerts
      SET is_dismissed = true, dismissed_at = NOW()
      WHERE id = ${alertId}
    `;

    return NextResponse.json({
      success: true,
      message: "Alert dismissed",
    });
  } catch (error: any) {
    console.error("❌ Error dismissing alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}




