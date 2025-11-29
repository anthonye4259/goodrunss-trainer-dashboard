import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

// POST - Handle Stripe webhook events
export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`⚠️  Webhook signature verification failed:`, err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      console.log("✅ Payment successful for session:", session.id)

      // Check if this is a class package purchase
      if (session.metadata?.bookingType === 'class_package') {
        const { packageId, packageType, credits, durationDays, clientEmail, trainerId } = session.metadata
        
        // Calculate expiration date
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays))

        // Create client package
        await prisma.$queryRaw`
          INSERT INTO client_packages (
            client_email, trainer_id, package_id, package_name, package_type,
            total_credits, remaining_credits, expires_at, stripe_payment_intent_id
          )
          VALUES (
            ${clientEmail}, ${trainerId}, ${packageId}, ${session.metadata.packageName}, ${packageType},
            ${credits ? parseInt(credits) : null}, ${credits ? parseInt(credits) : null},
            ${expiresAt}, ${session.payment_intent as string}
          )
        `

        console.log("✅ Class package purchased:", packageId)
        
        return NextResponse.json({ success: true, packageId })
      }

      // Check if this is a group class booking
      if (session.metadata?.bookingType === 'group_class') {
        const classId = session.metadata.classId
        
        // Find and confirm the group class booking
        await prisma.$queryRaw`
          UPDATE group_class_bookings
          SET status = 'confirmed', payment_status = 'paid'
          WHERE stripe_session_id = ${session.id}
        `

        // Update class booking count
        await prisma.$queryRaw`
          UPDATE group_classes
          SET current_bookings = current_bookings + 1
          WHERE id = ${classId}
        `

        console.log("✅ Group class booking confirmed:", classId)
        
        // TODO: Send confirmation email
        
        return NextResponse.json({ success: true, classId })
      }

      // Handle regular 1-on-1 booking
      const booking = await prisma.publicBooking.findFirst({
        where: { stripeSessionId: session.id },
        include: {
          bookingSettings: {
            include: {
              trainer: true,
            },
          },
        },
      })

      if (!booking) {
        console.error("❌ Booking not found for session:", session.id)
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }

      // Update booking status to confirmed
      const updatedBooking = await prisma.publicBooking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'paid',
          status: 'confirmed',
          confirmedAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string || null,
        },
      })

      console.log("✅ Booking confirmed:", updatedBooking.id)

      // TODO: Send confirmation emails to client and trainer
      // You can integrate with your email service here (Resend, SendGrid, etc.)

      return NextResponse.json({ success: true, bookingId: updatedBooking.id })
    }

    // Handle the checkout.session.expired event
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session

      console.log("⏰ Payment session expired:", session.id)

      // Update booking to cancelled
      await prisma.publicBooking.updateMany({
        where: { stripeSessionId: session.id },
        data: {
          paymentStatus: 'failed',
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })

      return NextResponse.json({ success: true })
    }

    // Handle refund events
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge

      console.log("💸 Refund processed:", charge.id)

      // Find booking by payment intent
      const booking = await prisma.publicBooking.findFirst({
        where: { stripePaymentIntentId: charge.payment_intent as string },
      })

      if (booking) {
        await prisma.publicBooking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'refunded',
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        })
      }

      return NextResponse.json({ success: true })
    }

    console.log(`Unhandled event type: ${event.type}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


