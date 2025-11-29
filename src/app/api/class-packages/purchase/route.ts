import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/class-packages/purchase
 * Purchase a class package
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      packageId,
      slug,
      clientName,
      clientEmail,
    } = body

    if (!packageId || !slug || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Find trainer by slug
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!settings) {
      return NextResponse.json(
        { error: "Trainer not found" },
        { status: 404 }
      )
    }

    // Get package details
    const pkg: any = await prisma.$queryRawUnsafe(`
      SELECT * FROM class_packages
      WHERE id = '${packageId}' AND trainer_id = '${settings.trainerId}' AND is_active = true
    `)

    if (!pkg || pkg.length === 0) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      )
    }

    const packageData = pkg[0]

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(parseFloat(packageData.price) * 100),
            product_data: {
              name: packageData.name,
              description: packageData.description || `${packageData.credits || 'Unlimited'} classes with ${settings.displayName}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}/success?session_id={CHECKOUT_SESSION_ID}&type=package`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${slug}`,
      metadata: {
        bookingSlug: slug,
        trainerId: settings.trainerId,
        packageId: packageId,
        packageName: packageData.name,
        packageType: packageData.package_type,
        credits: packageData.credits?.toString() || '0',
        durationDays: packageData.duration_days.toString(),
        clientName,
        clientEmail,
        bookingType: 'class_package',
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    })
  } catch (error: any) {
    console.error("Error purchasing package:", error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

