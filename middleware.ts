import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define route matchers
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/services(.*)',
  '/availability(.*)',
  '/calendar(.*)',
  '/clients(.*)',
  '/payments(.*)',
  '/settings(.*)',
  '/subscription(.*)',
])

// Admin emails - only these users can access /admin
const ADMIN_EMAILS = [
  'anthony@goodrunss.com',
  'anthonyedwards@goodrunss.com',
  'anthonye@andrew.cmu.edu',
]

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Admin route protection
  if (isAdminRoute(req)) {
    if (!userId) {
      // Not logged in - redirect to admin login
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin email
    const user = await auth().then(a => a.sessionClaims)
    const userEmail = user?.email as string
    
    if (!ADMIN_EMAILS.includes(userEmail?.toLowerCase())) {
      // Not an admin - redirect to regular dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Protected routes (dashboard, etc.)
  if (isProtectedRoute(req)) {
    if (!userId) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and Stripe webhooks
    '/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes (except webhooks which are excluded above)
    '/(api|trpc)(.*)',
  ],
}
