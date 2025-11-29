import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/book/[slug]/classes
 * Public endpoint - Get available group classes for a trainer
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Find trainer by booking slug
    const settings = await prisma.bookingSettings.findUnique({
      where: { bookingSlug: slug, isActive: true },
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
        { success: false, error: "Trainer not found or booking not active" },
        { status: 404 }
      )
    }

    // Get all upcoming group classes for this trainer
    const classes: any = await prisma.$queryRawUnsafe(`
      SELECT 
        g.id,
        g.name,
        g.description,
        g.scheduled_at,
        g.duration,
        g.max_capacity,
        g.price_per_person,
        g.location,
        g.level,
        g.status,
        (SELECT COUNT(*) FROM group_class_bookings WHERE class_id = g.id AND status = 'confirmed') as current_bookings,
        (SELECT COUNT(*) FROM waitlist_entries WHERE session_id = g.id::text AND status = 'waiting') as waitlist_count
      FROM group_classes g
      WHERE g.trainer_id = '${settings.trainerId}'
        AND g.scheduled_at > NOW()
        AND g.status = 'scheduled'
      ORDER BY g.scheduled_at ASC
    `)

    // Format response
    const formattedClasses = classes.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      description: cls.description || null,
      scheduledAt: cls.scheduled_at,
      duration: cls.duration,
      maxCapacity: cls.max_capacity,
      pricePerPerson: parseFloat(cls.price_per_person),
      location: cls.location || null,
      level: cls.level || 'all_levels',
      status: cls.status,
      currentBookings: parseInt(cls.current_bookings) || 0,
      waitlistCount: parseInt(cls.waitlist_count) || 0,
      spotsLeft: cls.max_capacity - (parseInt(cls.current_bookings) || 0),
      isFull: parseInt(cls.current_bookings) >= cls.max_capacity
    }))

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      trainerName: settings.trainer.name
    })
  } catch (error: any) {
    console.error("Error fetching public classes:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

