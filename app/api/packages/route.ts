import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// GET /api/packages - List all packages for a trainer
export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const packages = await prisma.servicePackage.findMany({
      where: { trainerId: trainer.id },
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}

// POST /api/packages - Create a new package
export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trainer = await prisma.users.findUnique({
      where: { clerkId: userId },
    })

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      description,
      sessionsIncluded,
      packageType,
      sport,
      price,
      savings,
      currency,
      validityDays,
      features,
      stripePriceId,
    } = body

    // Validation
    if (!name || !sessionsIncluded || !packageType || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const servicePackage = await prisma.servicePackage.create({
      data: {
        trainerId: trainer.id,
        name,
        description,
        sessionsIncluded,
        packageType,
        sport,
        price,
        savings,
        currency: currency || "USD",
        validityDays,
        features: features || [],
        stripePriceId,
      },
    })

    return NextResponse.json({ package: servicePackage }, { status: 201 })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    )
  }
}

