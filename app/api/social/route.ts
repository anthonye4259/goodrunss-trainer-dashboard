import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/social - Get social/viral content for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const contentType = searchParams.get("contentType")

    const where: any = { userId: trainer.id }
    if (contentType) {
      where.contentType = contentType
    }

    const content = await prisma.viralContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Get viral metrics
    const metrics = await prisma.viralMetrics.findMany({
      where: { userId: trainer.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    // Get referral tracking
    const referrals = await prisma.referralTracking.findMany({
      where: { referrerId: trainer.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      content,
      metrics,
      referrals,
      summary: {
        totalContent: content.length,
        totalShares: content.reduce((sum, c) => sum + c.shareCount, 0),
        totalReferrals: referrals.length,
        conversions: referrals.filter((r) => r.converted).length,
      },
    })
  } catch (error) {
    console.error("Error fetching social content:", error)
    return NextResponse.json(
      { error: "Failed to fetch social content" },
      { status: 500 }
    )
  }
}

// POST /api/social - Create viral content
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await req.json()
    const { contentType, contentData } = body

    // Validation
    if (!contentType || !contentData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const content = await prisma.viralContent.create({
      data: {
        userId: trainer.id,
        contentType,
        contentData,
      },
    })

    return NextResponse.json({ content }, { status: 201 })
  } catch (error) {
    console.error("Error creating social content:", error)
    return NextResponse.json(
      { error: "Failed to create social content" },
      { status: 500 }
    )
  }
}

