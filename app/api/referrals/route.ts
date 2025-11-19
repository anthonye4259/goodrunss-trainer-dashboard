import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/referrals - Get referral data for a trainer
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

    // Get all referrals
    const referrals = await prisma.referralTracking.findMany({
      where: { referrerId: trainer.id },
      orderBy: { createdAt: "desc" },
    })

    // Calculate stats
    const totalReferrals = referrals.length
    const conversions = referrals.filter((r) => r.converted).length
    const conversionRate = totalReferrals > 0 ? (conversions / totalReferrals) * 100 : 0

    // Group by source
    const bySource = referrals.reduce((acc: any, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      referrals,
      stats: {
        totalReferrals,
        conversions,
        conversionRate,
        bySource,
      },
    })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    )
  }
}

// POST /api/referrals - Track a new referral
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referrerId, referredEmail, source, referralCode } = body

    // Validation
    if (!referredEmail || !source || !referralCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const referral = await prisma.referralTracking.create({
      data: {
        referrerId,
        referredEmail,
        source,
        referralCode,
      },
    })

    return NextResponse.json({ referral }, { status: 201 })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json(
      { error: "Failed to track referral" },
      { status: 500 }
    )
  }
}

