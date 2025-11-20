import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/packages - List all session packages
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('clientId')

    // Packages stored as payments with type PACKAGE
    const where: any = {
      trainerId: trainer.id,
      paymentType: 'PACKAGE'
    }

    if (clientId) {
      where.clientId = clientId
    }

    const packages = await prisma.payments.findMany({
      where,
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Parse package details from description
    const packagesWithDetails = packages.map(pkg => {
      let details = {
        sessions: 10,
        used: 0,
        remaining: 10
      }

      try {
        if (pkg.description) {
          const parsed = JSON.parse(pkg.description)
          details = parsed
        }
      } catch (e) {
        // Not JSON, extract from text
        const match = pkg.description?.match(/(\d+)\s*sessions?/i)
        if (match) {
          details.sessions = parseInt(match[1])
        }
      }

      return {
        id: pkg.id,
        client: pkg.clients,
        sessions: details.sessions,
        used: details.used,
        remaining: details.remaining,
        price: pkg.amount,
        status: pkg.status,
        purchasedAt: pkg.createdAt,
        expiresAt: pkg.dueDate
      }
    })

    return NextResponse.json({
      success: true,
      packages: packagesWithDetails,
      total: packagesWithDetails.length
    })
  } catch (error) {
    console.error("Error fetching packages:", error)
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    )
  }
}

// POST /api/packages - Create/sell a package
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { clientId, sessions, price, expiryDays } = body

    if (!clientId || !sessions || !price) {
      return NextResponse.json(
        { error: "ClientId, sessions, and price required" },
        { status: 400 }
      )
    }

    const client = await prisma.clients.findFirst({
      where: { id: clientId, trainerId: trainer.id }
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null

    const packageRecord = await prisma.payments.create({
      data: {
        id: crypto.randomUUID(),
        trainerId: trainer.id,
        clientId,
        amount: price,
        currency: 'usd',
        status: 'PENDING',
        paymentType: 'PACKAGE',
        description: JSON.stringify({
          sessions,
          used: 0,
          remaining: sessions
        }),
        dueDate: expiryDate,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Send package details to client
    if (client.email) {
      await sendEmail({
        to: client.email,
        subject: `Session Package: ${sessions} Sessions 🎁`,
        html: `<h2>Session Package Purchased!</h2><p>Hi ${client.name}!</p><p>You've purchased a <strong>${sessions}-session package</strong>.</p><p><strong>Price:</strong> $${price}<br><strong>Sessions:</strong> ${sessions}<br>${expiryDate ? `<strong>Expires:</strong> ${expiryDate.toLocaleDateString()}` : ''}</p><p>Book your sessions anytime!</p>`,
        text: `${sessions}-session package purchased for $${price}. Book anytime!`
      })
    }

    return NextResponse.json({
      success: true,
      message: "Package created",
      package: {
        id: packageRecord.id,
        sessions,
        price,
        remaining: sessions
      }
    })
  } catch (error) {
    console.error("Error creating package:", error)
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    )
  }
}

// PATCH /api/packages - Use/redeem a session from package
export async function PATCH(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { packageId, action } = body

    if (!packageId) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 })
    }

    const packageRecord = await prisma.payments.findFirst({
      where: {
        id: packageId,
        trainerId: trainer.id,
        paymentType: 'PACKAGE'
      }
    })

    if (!packageRecord) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    const details = JSON.parse(packageRecord.description || '{}')

    if (action === 'use') {
      if (details.remaining <= 0) {
        return NextResponse.json({ error: "No sessions remaining" }, { status: 400 })
      }

      details.used += 1
      details.remaining -= 1
    } else if (action === 'refund') {
      if (details.used <= 0) {
        return NextResponse.json({ error: "No sessions to refund" }, { status: 400 })
      }

      details.used -= 1
      details.remaining += 1
    }

    await prisma.payments.update({
      where: { id: packageId },
      data: {
        description: JSON.stringify(details),
        status: details.remaining === 0 ? 'COMPLETED' : 'PENDING',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: action === 'use' ? 'Session redeemed' : 'Session refunded',
      remaining: details.remaining
    })
  } catch (error) {
    console.error("Error updating package:", error)
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    )
  }
}
