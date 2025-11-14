import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/user/onboarding
 * Complete user onboarding and save all initial data
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      specialties,
      timezone,
      language,
    } = body;

    // Combine first and last name
    const fullName = [firstName, lastName].filter(Boolean).join(" ") || undefined;

    // Find existing user
    let existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: userId },
          { email: userId }
        ]
      },
    });

    let user;

    if (existingUser) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...(fullName && { name: fullName }),
          ...(specialties && { specialties }),
          // TODO: Add timezone and language fields to schema if needed
        },
      });
    } else {
      // Create new user (first time)
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userId,
          name: fullName,
          specialties: specialties || [],
          role: "TRAINER",
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      user,
      message: "Onboarding completed successfully" 
    });
    
  } catch (error: any) {
    console.error("❌ Error completing onboarding:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}




