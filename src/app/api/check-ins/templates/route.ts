import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/check-ins/templates
 * Get check-in templates for trainer
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




