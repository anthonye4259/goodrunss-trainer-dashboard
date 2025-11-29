import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

/**
 * GET /api/class-packages
 * Get all class packages for a trainer (or public packages by slug)
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const trainerId = url.searchParams.get("trainerId")
    const slug = url.searchParams.get("slug")

    let trainerIdToUse = trainerId

    // If slug is provided (public access), find trainer by slug
    if (slug && !trainerId) {
      const settings = await prisma.bookingSettings.findUnique({
        where: { bookingSlug: slug },
        select: { trainerId: true }
      })
      trainerIdToUse = settings?.trainerId || null
    }

    // If no trainer ID found, check auth
    if (!trainerIdToUse) {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const user = await prisma.user.findFirst({
        where: { OR: [{ id: userId }, { email: userId }] },
      })
      trainerIdToUse = user?.id || null
    }

    if (!trainerIdToUse) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 })
    }

    // Fetch packages
    const packages: any = await prisma.$queryRawUnsafe(`
      SELECT *
      FROM class_packages
      WHERE trainer_id = '${trainerIdToUse}' AND is_active = true
      ORDER BY price ASC
    `)

    return NextResponse.json({
      success: true,
      packages: packages.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        packageType: pkg.package_type,
        credits: pkg.credits,
        durationDays: pkg.duration_days,
        price: parseFloat(pkg.price),
        stripePriceId: pkg.stripe_price_id,
        isActive: pkg.is_active
      }))
    })
  } catch (error: any) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/class-packages
 * Create a new class package
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const {
      name,
      description,
      packageType,
      credits,
      durationDays,
      price,
    } = body

    if (!name || !packageType || !price || !durationDays) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create package
    const newPackage: any = await prisma.$queryRaw`
      INSERT INTO class_packages (trainer_id, name, description, package_type, credits, duration_days, price)
      VALUES (${user.id}, ${name}, ${description || null}, ${packageType}, ${credits || null}, ${durationDays}, ${price})
      RETURNING *
    `

    const pkg = Array.isArray(newPackage) ? newPackage[0] : newPackage

    return NextResponse.json({
      success: true,
      package: {
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        packageType: pkg.package_type,
        credits: pkg.credits,
        durationDays: pkg.duration_days,
        price: parseFloat(pkg.price),
      },
      message: "Package created successfully"
    })
  } catch (error: any) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

