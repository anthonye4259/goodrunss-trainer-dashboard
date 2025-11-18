/**
 * Stripe Webhook - Handle payment completion and user creation
 * PRODUCTION-READY with idempotency, error recovery, and proper logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const prisma = new PrismaClient()
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// In-memory cache for recently processed events (prevents duplicate processing)
const processedEvents = new Map<string, number>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

// Cleanup old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [eventId, timestamp] of processedEvents.entries()) {
    if (now - timestamp > CACHE_TTL) {
      processedEvents.delete(eventId)
    }
  }
}, 60 * 60 * 1000) // Every hour

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let event: Stripe.Event

  try {
    // ============================================
    // 1. VERIFY STRIPE SIGNATURE
    // ============================================
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('[WEBHOOK] Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`[WEBHOOK] Signature verification failed: ${err.message}`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // ============================================
    // 2. IDEMPOTENCY CHECK (In-Memory)
    // ============================================
    const eventId = event.id
    if (processedEvents.has(eventId)) {
      console.log(`[WEBHOOK] Event ${eventId} already processed (cache), skipping`)
      return NextResponse.json({ success: true, cached: true })
    }

    console.log(`[WEBHOOK] Processing event ${eventId} (${event.type})`)

    // ============================================
    // 3. HANDLE EVENTS
    // ============================================
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract customer details
        const customerEmail = session.customer_email || session.customer_details?.email
        const customerName = session.customer_details?.name
        const customerId = session.customer as string
        const metadata = session.metadata

        if (!customerEmail) {
          console.error(`[WEBHOOK] No email in session ${session.id}`)
          return NextResponse.json({ error: 'Missing email' }, { status: 400 })
        }

        const plan = metadata?.plan || '3-month'
        const password = metadata?.password
        const businessName = metadata?.businessName

        console.log(`[WEBHOOK] Payment from ${customerEmail}, plan: ${plan}`)

        // ============================================
        // 4. CHECK IF USER ALREADY EXISTS (Idempotency - Database)
        // ============================================
        const existingUser = await prisma.user.findUnique({
          where: { email: customerEmail },
          include: { subscriptions: true },
        })

        if (existingUser) {
          console.log(`[WEBHOOK] User ${customerEmail} already exists`)
          
          // Check if they already have an active subscription for this payment
          const existingSubscription = existingUser.subscriptions.find(
            sub => sub.stripeCustomerId === customerId && sub.status === 'active'
          )

          if (existingSubscription) {
            console.log(`[WEBHOOK] Subscription already exists, marking as processed`)
            processedEvents.set(eventId, Date.now())
            return NextResponse.json({ 
              success: true, 
              message: 'User and subscription already exist',
              userId: existingUser.id 
            })
          }

          // User exists but no subscription - add subscription only
          const planDuration = { '3-month': 90, '6-month': 180, '1-year': 365 }[plan] || 90
          const now = new Date()
          const endDate = new Date(now)
          endDate.setDate(endDate.getDate() + planDuration)

          await prisma.userSubscription.create({
            data: {
              userId: existingUser.id,
              userEmail: customerEmail,
              planId: plan,
              planName: `${plan} Trainer Plan`,
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              billingCycle: plan,
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
            },
          })

          processedEvents.set(eventId, Date.now())
          console.log(`[WEBHOOK] Added subscription to existing user ${existingUser.id}`)
          return NextResponse.json({ success: true, userId: existingUser.id })
        }

        // ============================================
        // 5. CREATE NEW USER (Atomic Operation)
        // ============================================
        let clerkUserId: string | null = null
        let dbUserId: string | null = null

        try {
          // Step 1: Create Clerk user
          console.log(`[WEBHOOK] Creating Clerk user for ${customerEmail}`)
          
          const clerkUser = await clerkClient.users.createUser({
            emailAddress: [customerEmail],
            password: password || undefined,
            firstName: customerName?.split(' ')[0] || undefined,
            lastName: customerName?.split(' ').slice(1).join(' ') || undefined,
            publicMetadata: {
              role: 'trainer',
              plan,
              businessName: businessName || undefined,
            },
          })

          clerkUserId = clerkUser.id
          console.log(`[WEBHOOK] Clerk user created: ${clerkUserId}`)

          // Step 2: Create database user
          console.log(`[WEBHOOK] Creating database user`)
          
          const dbUser = await prisma.user.create({
            data: {
              clerkId: clerkUserId,
              email: customerEmail,
              name: customerName || customerEmail.split('@')[0],
              role: 'TRAINER',
              stripeCustomerId: customerId,
              emailVerified: new Date(),
            },
          })

          dbUserId = dbUser.id
          console.log(`[WEBHOOK] Database user created: ${dbUserId}`)

          // Step 3: Create subscription
          const planDuration = { '3-month': 90, '6-month': 180, '1-year': 365 }[plan] || 90
          const now = new Date()
          const endDate = new Date(now)
          endDate.setDate(endDate.getDate() + planDuration)

          await prisma.userSubscription.create({
            data: {
              userId: dbUserId,
              userEmail: customerEmail,
              planId: plan,
              planName: `${plan} Trainer Plan`,
              stripeCustomerId: customerId,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              billingCycle: plan,
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
            },
          })

          console.log(`[WEBHOOK] Subscription created for ${dbUserId}`)

          // Step 4: Send welcome email (non-blocking)
          if (process.env.RESEND_API_KEY) {
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'GoodRunss <anthony@goodrunss.com>',
                to: [customerEmail],
                subject: 'Welcome to GoodRunss Trainer Dashboard! 🎉',
                html: `
                  <h1>Welcome to GoodRunss!</h1>
                  <p>Hi ${customerName || 'there'},</p>
                  <p>Your ${plan} plan is now active! You can log in at:</p>
                  <p><a href="https://goodrunss-trainer-dashboard.vercel.app/login">Login to Dashboard</a></p>
                  <p>If you have any questions, just reply to this email.</p>
                  <p>Let's get training! 💪</p>
                  <p>- The GoodRunss Team</p>
                `,
              }),
            }).catch(err => {
              console.error(`[WEBHOOK] Failed to send welcome email: ${err.message}`)
            })
          }

          // Mark as processed
          processedEvents.set(eventId, Date.now())
          
          const processingTime = Date.now() - startTime
          console.log(`[WEBHOOK] ✅ User created successfully in ${processingTime}ms`)

          return NextResponse.json({
            success: true,
            userId: dbUserId,
            clerkId: clerkUserId,
            processingTime,
          })

        } catch (error: any) {
          console.error(`[WEBHOOK] ❌ Error creating user: ${error.message}`)
          
          // ROLLBACK: Clean up Clerk user if database creation failed
          if (clerkUserId && !dbUserId) {
            console.log(`[WEBHOOK] Rolling back Clerk user ${clerkUserId}`)
            try {
              await clerkClient.users.deleteUser(clerkUserId)
              console.log(`[WEBHOOK] Clerk user deleted`)
            } catch (deleteError: any) {
              console.error(`[WEBHOOK] Failed to delete Clerk user: ${deleteError.message}`)
            }
          }

          // Don't mark as processed - allow Stripe to retry
          return NextResponse.json({ 
            error: 'User creation failed', 
            details: error.message,
            retryable: true,
          }, { status: 500 })
        }
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        console.log(`[WEBHOOK] Updating subscription ${subscription.id}`)
        
        const updated = await prisma.userSubscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
          },
        })

        processedEvents.set(eventId, Date.now())
        console.log(`[WEBHOOK] Updated ${updated.count} subscription(s)`)
        return NextResponse.json({ success: true, updated: updated.count })
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`)
        return NextResponse.json({ received: true })
    }

  } catch (error: any) {
    console.error(`[WEBHOOK] ❌ Fatal error: ${error.message}`)
    console.error(error.stack)
    
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      details: error.message,
      retryable: true,
    }, { status: 500 })
  }
}
