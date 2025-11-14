import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch trainer's bookings
export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") // pending, confirmed, cancelled, completed
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      trainerId: user.id,
    }

    if (status) {
      where.status = status
    }

    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = new Date(startDate)
      if (endDate) where.startTime.lte = new Date(endDate)
    }

    const bookings = await prisma.publicBooking.findMany({
      where,
      orderBy: { startTime: 'asc' },
    })

    // Calculate stats
    const stats = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      revenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + Number(b.price), 0),
    }

    return NextResponse.json({ success: true, bookings, stats })
  } catch (error: any) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PATCH - Update booking status
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ id: userId }, { email: userId }] },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const bookingId = searchParams.get("id")

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Booking ID required" }, { status: 400 })
    }

    const body = await req.json()
    const { status, notes } = body

    // Verify ownership
    const booking = await prisma.publicBooking.findFirst({
      where: {
        id: bookingId,
        trainerId: user.id,
      },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 })
    }

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date()
      } else if (status === 'completed') {
        updateData.completedAt = new Date()
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const updatedBooking = await prisma.publicBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    return NextResponse.json({ success: true, booking: updatedBooking })
  } catch (error: any) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


