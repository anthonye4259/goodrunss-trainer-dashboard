/**
 * Sentry Server Configuration
 * 
 * Tracks errors in server-side code (API routes, getServerSideProps, etc.)
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Ignore specific errors
  ignoreErrors: [
    // Database connection errors (handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
  ],
  
  // Before sending
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    if (event.request?.data && typeof event.request.data === 'object' && event.request.data !== null && event.request) {
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
      const requestData = event.request.data as Record<string, any>;
      sensitiveFields.forEach(field => {
        if (field in requestData) {
          requestData[field] = '[REDACTED]';
        }
      });
    }
    
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry event (not sent):', event);
      return null;
    }
    
    return event;
  },
});
