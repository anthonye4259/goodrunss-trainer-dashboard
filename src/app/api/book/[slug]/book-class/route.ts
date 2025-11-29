import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/book/[slug]/book-class
 * Public endpoint - Book a spot in a group class
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await req.json()
    const {
      classId,
      clientName,
      clientEmail,
      clientPhone,
      usePackage, // If user has a class package
      packageId, // ID of package to use credit from
    } = body

    // Validate inputs
    if (!classId || !clientName || !clientEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find trainer
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug, isActive: true },
      include: {
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

    // Get class info
    const classInfo: any = await prisma.$queryRawUnsafe(`
      SELECT 
        id, name, scheduled_at, duration, max_capacity, price_per_person,
        (SELECT COUNT(*) FROM group_class_bookings WHERE class_id = '${classId}' AND status = 'confirmed') as current_bookings
      FROM group_classes
      WHERE id = '${classId}' AND trainer_id = '${settings.trainerId}'
    `)

    if (!classInfo || classInfo.length === 0) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 }
      )
    }

    const cls = classInfo[0]
    const currentBookings = parseInt(cls.current_bookings) || 0
    const isFull = currentBookings >= cls.max_capacity

    // If class is full, add to waitlist
    if (isFull && !usePackage) {
      await prisma.$queryRaw`
        INSERT INTO waitlist_entries (session_id, email, name, phone, status)
        VALUES (${classId}, ${clientEmail}, ${clientName}, ${clientPhone || null}, 'waiting')
      `

      return NextResponse.json({
        success: true,
        waitlisted: true,
        message: "Class is full. You've been added to the waitlist!",
      })
    }

    // If using a package/pass, deduct credit and book
    if (usePackage && packageId) {
      // TODO: Implement package credit deduction
      // For now, just book directly
      
      await prisma.$queryRaw`
        INSERT INTO group_class_bookings (class_id, client_id, client_name, client_email, client_phone, status, payment_status)
        VALUES (${classId}, NULL, ${clientName}, ${clientEmail}, ${clientPhone || null}, 'confirmed', 'paid')
      `

      await prisma.$queryRaw`
        UPDATE group_classes
        SET current_bookings = current_bookings + 1
        WHERE id = ${classId}
      `

      return NextResponse.json({
        success: true,
        message: "Booked successfully using class package!",
      })
    }

    // Create Stripe Checkout Session for drop-in payment
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(parseFloat(cls.price_per_person) * 100),
            product_data: {
              name: cls.name,
              description: `${cls.duration} minutes with ${settings.displayName}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}/success?session_id={CHECKOUT_SESSION_ID}&type=class`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}`,
      metadata: {
        bookingSlug: slug,
        trainerId: settings.trainerId,
        classId: classId,
        className: cls.name,
        clientName,
        clientEmail,
        clientPhone: clientPhone || '',
        bookingType: 'group_class',
      },
    })

    // Create pending booking (will be confirmed by webhook)
    await prisma.$queryRaw`
      INSERT INTO group_class_bookings (
        class_id, client_name, client_email, client_phone, 
        status, payment_status, stripe_session_id
      )
      VALUES (
        ${classId}, ${clientName}, ${clientEmail}, ${clientPhone || null},
        'pending', 'pending', ${checkoutSession.id}
      )
    `

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    })
  } catch (error: any) {
    console.error("Error booking class:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

