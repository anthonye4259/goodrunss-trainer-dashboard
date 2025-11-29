import { NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    console.log(`[CREATE FREE TRAINER] Creating account for: ${email}`)

    // Step 1: Create Clerk user account
    const client = await clerkClient()
    
    let clerkUser
    try {
      clerkUser = await client.users.createUser({
        emailAddress: [email],
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || "",
        skipPasswordRequirement: false, // They'll need to set password
        publicMetadata: {
          role: "trainer",
          freeAccount: true,
        },
      })
      console.log(`[CREATE FREE TRAINER] Clerk user created: ${clerkUser.id}`)
    } catch (clerkError: any) {
      console.error("[CREATE FREE TRAINER] Clerk error:", clerkError)
      
      // Check if user already exists
      if (clerkError.errors?.[0]?.code === "form_identifier_exists") {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        )
      }
      
      throw clerkError
    }

    // Step 2: Create user in database
    const dbUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        clerkId: clerkUser.id,
        email: email,
        name: name,
        role: "TRAINER",
        emailVerified: new Date(),
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log(`[CREATE FREE TRAINER] Database user created: ${dbUser.id}`)

    // Step 3: Create lifetime free subscription
    await prisma.user_subscriptions.create({
      data: {
        id: crypto.randomUUID(),
        userId: clerkUser.id,
        userEmail: email,
        planId: "free-lifetime",
        planName: "Lifetime Free Access - VIP",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        status: "active",
        billingCycle: "lifetime",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date("2099-12-31"),
        trialStart: null,
        trialEnd: null,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null,
        metadata: {
          freeAccount: true,
          grantedBy: "admin",
          grantedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
    console.log(`[CREATE FREE TRAINER] Free subscription created`)

    // Step 4: Clerk automatically sends invitation email

    return NextResponse.json({
      success: true,
      message: `Account created successfully for ${name}!`,
      details: {
        email: email,
        name: name,
        clerkId: clerkUser.id,
        subscriptionStatus: "active",
        subscriptionType: "Lifetime Free Access",
        nextStep: `${name} will receive an email to set their password and can then log in at your dashboard URL.`,
      },
    })
  } catch (error: any) {
    console.error("[CREATE FREE TRAINER] Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to create account", 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

