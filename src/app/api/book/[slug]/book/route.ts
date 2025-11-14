import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// POST - Create a booking with Stripe payment (PUBLIC)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json()
    const {
      clientName,
      clientEmail,
      clientPhone,
      sessionTypeId,
      startTime,
      notes,
    } = body

    // Validate inputs
    if (!clientName || !clientEmail || !sessionTypeId || !startTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Fetch trainer's booking settings
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug, isActive: true },
      include: {
        availability: {
          where: { isActive: true },
        },
        blockedSlots: {
          where: {
            endTime: { gte: new Date() },
          },
        },
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Trainer not found or booking not active" },
        { status: 404 }
      )
    }

    // Find the session type
    const sessionTypes = settings.sessionTypes as any[]
    const sessionType = sessionTypes.find((st: any) => st.id === sessionTypeId)

    if (!sessionType) {
      return NextResponse.json(
        { success: false, error: "Session type not found" },
        { status: 404 }
      )
    }

    const slotStart = new Date(startTime)
    const slotEnd = new Date(slotStart.getTime() + sessionType.duration * 60 * 1000)

    // Check minimum notice
    const now = new Date()
    const minNoticeTime = new Date(now.getTime() + settings.minNoticeHours * 60 * 60 * 1000)
    if (slotStart < minNoticeTime) {
      return NextResponse.json(
        { success: false, error: `Booking requires at least ${settings.minNoticeHours} hours notice` },
        { status: 400 }
      )
    }

    // Check if slot is available (not blocked or booked)
    const existingBooking = await prisma.publicBooking.findFirst({
      where: {
        settingsId: settings.id,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            AND: [
              { startTime: { lte: slotStart } },
              { endTime: { gt: slotStart } },
            ],
          },
          {
            AND: [
              { startTime: { lt: slotEnd } },
              { endTime: { gte: slotEnd } },
            ],
          },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: "This time slot is no longer available" },
        { status: 400 }
      )
    }

    // Check blocked slots
    const blockedSlot = settings.blockedSlots.find((block: any) => {
      const blockStart = new Date(block.startTime)
      const blockEnd = new Date(block.endTime)
      return (
        (slotStart >= blockStart && slotStart < blockEnd) ||
        (slotEnd > blockStart && slotEnd <= blockEnd)
      )
    })

    if (blockedSlot) {
      return NextResponse.json(
        { success: false, error: "This time slot is blocked" },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(sessionType.price * 100), // Convert to cents
            product_data: {
              name: sessionType.name,
              description: `${sessionType.duration} minutes with ${settings.displayName}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}`,
      metadata: {
        bookingSlug: slug,
        settingsId: settings.id,
        trainerId: settings.trainerId,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        sessionTypeId,
        sessionTypeName: sessionType.name,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        duration: sessionType.duration.toString(),
        notes: notes || '',
      },
    })

    // Create pending booking (will be confirmed by webhook)
    const booking = await prisma.publicBooking.create({
      data: {
        settingsId: settings.id,
        trainerId: settings.trainerId,
        clientName,
        clientEmail,
        clientPhone: clientPhone || null,
        sessionTypeId,
        sessionTypeName: sessionType.name,
        startTime: slotStart,
        endTime: slotEnd,
        duration: sessionType.duration,
        price: sessionType.price,
        stripePriceId: sessionType.stripe_price_id || null,
        stripeSessionId: checkoutSession.id,
        paymentStatus: 'pending',
        status: 'pending',
        notes: notes || null,
      },
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        checkoutUrl: checkoutSession.url,
      },
    })
  } catch (error: any) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


