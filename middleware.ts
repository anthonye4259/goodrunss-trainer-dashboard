import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define routes that should be ignored by authentication
const isWebhookRoute = createRouteMatcher(['/api/webhooks(.*)'])

export default clerkMiddleware((auth, req) => {
  // If it's a webhook route, do nothing (allow access)
  if (isWebhookRoute(req)) {
    return
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
