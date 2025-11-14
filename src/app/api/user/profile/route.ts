import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/profile
 * Get current user's profile data
 */
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by Clerk ID
    const user = await prisma.user.findFirst({
      where: {
        // Try to match by email from Clerk OR existing session
        OR: [
          { id: userId },
          { email: userId } // In case userId is email
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        specialties: true,
        certifications: true,
        phone: true,
        location: true,
        hourlyRate: true,
        rating: true,
        totalSessions: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Create user if doesn't exist (first login)
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: userId, // Will be updated with real email
          role: "TRAINER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
          specialties: true,
          certifications: true,
          phone: true,
          location: true,
          hourlyRate: true,
          rating: true,
          totalSessions: true,
          role: true,
          createdAt: true,
        },
      });
      
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user });
    
  } catch (error: any) {
    console.error("❌ Error fetching user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update current user's profile data
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      bio,
      specialties,
      certifications,
      phone,
      location,
      hourlyRate,
      image,
    } = body;

    // Find existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userId }
        ]
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(bio !== undefined && { bio }),
        ...(specialties !== undefined && { specialties }),
        ...(certifications !== undefined && { certifications }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(image !== undefined && { image }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        specialties: true,
        certifications: true,
        phone: true,
        location: true,
        hourlyRate: true,
        rating: true,
        totalSessions: true,
        role: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: "Profile updated successfully" 
    });
    
  } catch (error: any) {
    console.error("❌ Error updating user profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}




