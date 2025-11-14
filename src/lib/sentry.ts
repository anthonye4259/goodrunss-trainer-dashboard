/**
 * Sentry Helper Functions
 * 
 * Use these to manually capture errors, messages, and performance
 */

import * as Sentry from '@sentry/nextjs';

// Capture exception
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Capture message
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}

// Set user context
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Clear user context
export function clearUser() {
  Sentry.setUser(null);
}

// Add breadcrumb
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
  });
}

// Wrap API route with error handling
export function withSentry<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  options?: { name?: string }
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error(`Error in ${options?.name || 'API route'}:`, error);
      Sentry.captureException(error, {
        extra: {
          handler: options?.name,
          args: args.map((arg) => {
            // Safely stringify args
            try {
              return JSON.stringify(arg);
            } catch {
              return String(arg);
            }
          }),
        },
      });
      throw error;
    }
  }) as T;
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

// Example usage in API route:
/*
import { withSentry, setUser, addBreadcrumb } from '@/lib/sentry';

export const POST = withSentry(async (req: NextRequest) => {
  const { userId } = await req.json();
  
  // Set user context
  setUser({ id: userId });
  
  // Add breadcrumb
  addBreadcrumb('Processing payment', 'payment', { userId });
  
  // Your logic here
  const result = await processPayment(userId);
  
  return NextResponse.json(result);
}, { name: 'POST /api/payments/create' });
*/

