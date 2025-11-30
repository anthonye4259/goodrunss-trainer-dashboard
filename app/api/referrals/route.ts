import { NextRequest, NextResponse } from "next/server"
import { getOrCreateUser } from "@/lib/get-or-create-user"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/send-email"

// GET /api/referrals - Get referral stats and links
export async function GET(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate unique referral link for trainer
    const referralCode = trainer.id.substring(0, 8).toUpperCase()
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`

    // Get referrals (clients who joined via this code)
    // We'd store referral source in client metadata
    const allClients = await prisma.clients.findMany({
      where: { trainerId: trainer.id }
    })

    const referrals = allClients.filter(c => {
      try {
        const notes = c.notes ? JSON.parse(c.notes) : {}
        return notes.referralSource === referralCode
      } catch (e) {
        return false
      }
    })

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
      stats: {
        totalReferrals: referrals.length,
        activeReferrals: referrals.length, // Would filter by activity
        revenue: referrals.length * 50, // Estimate
        rewards: referrals.length * 10 // $10 per referral
      },
      referrals: referrals.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        joinedAt: r.createdAt,
        status: 'ACTIVE'
      }))
    })
  } catch (error) {
    console.error("Error fetching referrals:", error)
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    )
  }
}

// POST /api/referrals - Send referral invites
export async function POST(req: NextRequest) {
  try {
    const trainer = await getOrCreateUser()
    if (!trainer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { emails, message } = body

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: "Emails required" }, { status: 400 })
    }

    const referralCode = trainer.id.substring(0, 8).toUpperCase()
    const referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`

    let sent = 0

    for (const email of emails) {
      try {
        await sendEmail({
          to: email,
          subject: `${trainer.name} Recommends GoodRunss! 🎁`,
          html: `
            <h2>You've Been Invited!</h2>
            <p>${trainer.name} thinks you'd love GoodRunss!</p>
            <p>${message || 'Join me on GoodRunss - the best platform for trainers and clients.'}</p>
            <p><a href="${referralLink}" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Get Started Free</a></p>
            <p><strong>Special Offer:</strong> Get 10% off your first month when you sign up through this link!</p>
            <p>Your referral code: <strong>${referralCode}</strong></p>
          `,
          text: `${trainer.name} invited you to GoodRunss! Sign up: ${referralLink} (Code: ${referralCode})`
        })

        sent++
      } catch (e) {
        console.error(`Failed to send to ${email}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sent} referral invites`,
      sent,
      total: emails.length
    })
  } catch (error) {
    console.error("Error sending referrals:", error)
    return NextResponse.json(
      { error: "Failed to send referrals" },
      { status: 500 }
    )
  }
}

// PATCH /api/referrals - Track referral (when someone signs up)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { referralCode, newClientId } = body

    if (!referralCode || !newClientId) {
      return NextResponse.json(
        { error: "Referral code and client ID required" },
        { status: 400 }
      )
    }

    // Find trainer by referral code (first 8 chars of ID)
    const trainers = await prisma.user.findMany({
      where: {
        id: { startsWith: referralCode.toLowerCase() }
      }
    })

    if (trainers.length === 0) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    const trainer = trainers[0]

    // Update client to mark referral source
    const client = await prisma.clients.findUnique({ where: { id: newClientId } })

    if (client) {
      const currentNotes = client.notes ? JSON.parse(client.notes) : {}
      await prisma.clients.update({
        where: { id: newClientId },
        data: {
          notes: JSON.stringify({
            ...currentNotes,
            referralSource: referralCode,
            referredBy: trainer.id
          })
        }
      })

      // Send thank you email to referring trainer
      if (trainer.email) {
        await sendEmail({
          to: trainer.email,
          subject: 'New Referral! 🎉',
          html: `<h2>Great News!</h2><p>Someone just signed up using your referral code!</p><p>Your referral rewards are adding up. Keep sharing!</p>`,
          text: 'Someone signed up using your referral code! Keep sharing!'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Referral tracked"
    })
  } catch (error) {
    console.error("Error tracking referral:", error)
    return NextResponse.json(
      { error: "Failed to track referral" },
      { status: 500 }
    )
  }
}
