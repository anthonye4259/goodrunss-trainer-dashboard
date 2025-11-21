import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/welcome',
  '/language-select',
  '/login(.*)',
  '/signup(.*)',
  '/checkout(.*)',
  '/api/webhooks/stripe(.*)',
  '/api/gpt(.*)', // GPT API routes for ChatGPT integration
  '/api/gia(.*)', // Gia AI chatbot routes (Google Gemini)
  '/book(.*)', // Public booking pages
  '/api/public(.*)', // Public API endpoints
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/api/admin(.*)',
])

const ADMIN_EMAILS = ['anthony@goodrunss.com']

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  
  // Protect admin routes
  if (isAdminRoute(request)) {
    const { userId } = await auth()
    
    if (!userId) {
      const signInUrl = new URL('/login', request.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }
    
    // Check if user is admin
    const { sessionClaims } = await auth()
    const userEmail = sessionClaims?.email as string
    
    if (!ADMIN_EMAILS.includes(userEmail)) {
      // Not an admin - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Protect all non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}




