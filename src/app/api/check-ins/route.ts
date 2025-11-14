import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/check-ins
 * Get check-ins for trainer's clients
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
    const clientId = url.searchParams.get("clientId");
    const status = url.searchParams.get("status") || "all";

    let query;
    if (clientId) {
      // Get check-ins for specific client
      query = await prisma.$queryRaw`
        SELECT c.*, t.name as template_name, t.type, u.name as client_name
        FROM check_ins c
        JOIN check_in_templates t ON c.template_id = t.id
        JOIN users u ON c.client_id = u.id
        WHERE t.trainer_id = ${user.id} AND c.client_id = ${clientId}
        ${status !== 'all' ? prisma.$queryRawUnsafe(`AND c.status = '${status}'`) : prisma.$queryRawUnsafe('')}
        ORDER BY c.scheduled_for DESC
        LIMIT 50
      `;
    } else {
      // Get all recent check-ins
      query = await prisma.$queryRaw`
        SELECT c.*, t.name as template_name, t.type, u.name as client_name
        FROM check_ins c
        JOIN check_in_templates t ON c.template_id = t.id
        JOIN users u ON c.client_id = u.id
        WHERE t.trainer_id = ${user.id}
        ${status !== 'all' ? prisma.$queryRawUnsafe(`AND c.status = '${status}'`) : prisma.$queryRawUnsafe('')}
        ORDER BY c.scheduled_for DESC
        LIMIT 100
      `;
    }

    return NextResponse.json({ success: true, checkIns: query });
  } catch (error: any) {
    console.error("❌ Error fetching check-ins:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-ins
 * Create check-in for client
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

    const body = await req.json();
    const { templateId, clientId, scheduledFor } = body;

    if (!templateId || !clientId || !scheduledFor) {
      return NextResponse.json(
        { error: "Template ID, Client ID, and Scheduled For are required" },
        { status: 400 }
      );
    }

    // Create check-in
    const checkIn = await prisma.$queryRaw`
      INSERT INTO check_ins (template_id, client_id, scheduled_for, status)
      VALUES (${templateId}, ${clientId}, ${scheduledFor}, 'pending')
      RETURNING *
    `;

    // TODO: Send push notification reminder

    return NextResponse.json({
      success: true,
      checkIn: Array.isArray(checkIn) ? checkIn[0] : checkIn,
      message: "Check-in scheduled",
    });
  } catch (error: any) {
    console.error("❌ Error creating check-in:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create check-in" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/check-ins/templates
 * Get check-in templates for trainer
 */
export async function GET_TEMPLATES(req: NextRequest) {
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

    const templates = await prisma.$queryRaw`
      SELECT * FROM check_in_templates 
      WHERE trainer_id = ${user.id} AND is_active = true
      ORDER BY name ASC
    `;

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("❌ Error fetching templates:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-ins/templates
 * Create check-in template
 */
export async function POST_TEMPLATE(req: NextRequest) {
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

    const body = await req.json();
    const { name, type, questions, schedule } = body;

    if (!name || !type || !questions) {
      return NextResponse.json(
        { error: "Name, type, and questions are required" },
        { status: 400 }
      );
    }

    const template = await prisma.$queryRaw`
      INSERT INTO check_in_templates (trainer_id, name, type, questions, schedule, is_active)
      VALUES (${user.id}, ${name}, ${type}, ${JSON.stringify(questions)}, ${schedule || null}, true)
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      template: Array.isArray(template) ? template[0] : template,
      message: "Template created",
    });
  } catch (error: any) {
    console.error("❌ Error creating template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create template" },
      { status: 500 }
    );
  }
}




