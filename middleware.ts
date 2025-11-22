import { clerkMiddleware } from '@clerk/nextjs/server'

// PASSIVE MIDDLEWARE - No server-side redirects
// This relies on the client-side application to handle protection
export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except webhooks
    '/(api|trpc)(?!/webhooks)(.*)',
  ],
}
