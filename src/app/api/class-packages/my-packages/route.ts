import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/class-packages/my-packages?email=xxx
 * Get client's active packages by email
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const email = url.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      )
    }

    // Fetch client's active packages
    const packages: any = await prisma.$queryRawUnsafe(`
      SELECT 
        cp.*,
        pkg.name as package_name,
        pkg.description as package_description
      FROM client_class_packages cp
      JOIN class_packages pkg ON cp.package_id = pkg.id
      WHERE cp.client_email = '${email}'
        AND cp.is_active = true
        AND (cp.expires_at IS NULL OR cp.expires_at > NOW())
        AND (cp.package_type = 'unlimited' OR cp.remaining_credits > 0)
      ORDER BY cp.purchased_at DESC
    `)

    return NextResponse.json({
      success: true,
      packages: packages.map((pkg: any) => ({
        id: pkg.id,
        packageName: pkg.package_name,
        packageDescription: pkg.package_description,
        packageType: pkg.package_type,
        totalCredits: pkg.total_credits,
        remainingCredits: pkg.remaining_credits,
        purchasedAt: pkg.purchased_at,
        expiresAt: pkg.expires_at,
        isUnlimited: pkg.package_type === 'unlimited',
        daysLeft: pkg.expires_at ? Math.ceil((new Date(pkg.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      }))
    })
  } catch (error: any) {
    console.error("Error fetching client packages:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

