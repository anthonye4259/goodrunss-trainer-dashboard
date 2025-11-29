import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/packages
 * Get all packages for current trainer
 */
export async function GET() {
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

    // Get all packages created by this trainer
    const packages = await prisma.$queryRaw`
      SELECT * FROM packages WHERE trainer_id = ${user.id} ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error("❌ Error fetching packages:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/packages
 * Create a new package
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
    const {
      name,
      description,
      sessions,
      price,
      validityDays,
      isRecurring,
      recurringInterval,
    } = body;

    // Validate required fields
    if (!name || !sessions || !price) {
      return NextResponse.json(
        { error: "Name, sessions, and price are required" },
        { status: 400 }
      );
    }

    // Create package
    const packageData = await prisma.$queryRaw`
      INSERT INTO packages (
        trainer_id, name, description, sessions, price, 
        validity_days, is_recurring, recurring_interval, is_active
      ) VALUES (
        ${user.id}, ${name}, ${description || null}, ${sessions}, ${price},
        ${validityDays || 90}, ${isRecurring || false}, ${recurringInterval || null}, true
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      package: Array.isArray(packageData) ? packageData[0] : packageData,
      message: "Package created successfully",
    });
  } catch (error: any) {
    console.error("❌ Error creating package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create package" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/packages/[id]
 * Delete a package
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const packageId = url.searchParams.get("id");

    if (!packageId) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete package (must be owned by trainer)
    await prisma.$queryRaw`
      DELETE FROM packages 
      WHERE id = ${packageId} AND trainer_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ Error deleting package:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete package" },
      { status: 500 }
    );
  }
}













