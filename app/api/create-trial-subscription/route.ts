/**
 * Create Stripe subscription with 7-day free trial
 * User must enter card but won't be charged until trial ends
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 503 }
      )
    }

    // Log incoming request
    console.log('[TRIAL SIGNUP] Request received')

    const { email, name, businessName, password, planId } = await request.json()

    console.log('[TRIAL SIGNUP] Parsed data:', { email, name: name?.substring(0, 10) + '...', planId, hasPassword: !!password })

    if (!email || !planId) {
      console.error('[TRIAL SIGNUP] Missing required fields')
      return NextResponse.json(
        { error: 'Email and plan ID are required' },
        { status: 400 }
      )
    }

    // Check Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[TRIAL SIGNUP] STRIPE_SECRET_KEY not configured')
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      )
    }

    // Ensure APP_URL has https:// scheme
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://goodrunss-trainer-dashboard.vercel.app'
    const baseUrl = appUrl.startsWith('http') ? appUrl : `https://${appUrl}`
    console.log('[TRIAL SIGNUP] Base URL:', baseUrl)

    // Map plan IDs to Stripe Price IDs
    const planPriceMapping: Record<string, { priceId: string; amount: number }> = {
      '6-month': {
        priceId: process.env.STRIPE_PRICE_6_MONTH || 'price_6month',
        amount: 75,
      },
      '3-month': {
        priceId: process.env.STRIPE_PRICE_3_MONTH || 'price_3month',
        amount: 40,
      },
      '1-year': {
        priceId: process.env.STRIPE_PRICE_1_YEAR || 'price_1year',
        amount: 100,
      },
    }

    const plan = planPriceMapping[planId]
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    // Create or retrieve Stripe customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    let customer: Stripe.Customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name || undefined,
        metadata: {
          planId: planId,
        },
      })
    }

    // Create Checkout Session with trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',

      // 7-day free trial
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          planId: planId,
          userId: email, // Will be updated with actual userId after Clerk creation
        },
      },

      // Allow promotion codes
      allow_promotion_codes: true,

      // Redirect URLs
      success_url: `${baseUrl}/trial-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/signup?step=plan`,

      // Collect payment method (card) but don't charge until trial ends
      payment_method_collection: 'always',

      // Customer can cancel anytime
      // Pass user data to webhook for account creation after payment
      metadata: {
        planId: planId,
        email: email,
        name: name,
        businessName: businessName || '',
        password: password, // Webhook will create Clerk account with this
        trialDays: '7',
      },
    })

    console.log('[TRIAL SIGNUP] ✅ Stripe session created:', session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('[TRIAL SIGNUP] ❌ Error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack?.split('\n').slice(0, 3)
    })

    return NextResponse.json(
      {
        error: error.message || 'Failed to create subscription',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

