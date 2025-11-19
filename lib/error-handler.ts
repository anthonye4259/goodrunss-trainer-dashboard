import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"

export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR")
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "AUTHENTICATION_ERROR")
    this.name = "AuthenticationError"
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "AUTHORIZATION_ERROR")
    this.name = "AuthorizationError"
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, "CONFLICT")
    this.name = "ConflictError"
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = "Too many requests", public retryAfter?: number) {
    super(message, 429, "RATE_LIMIT_EXCEEDED")
    this.name = "RateLimitError"
  }
}

// Error logging (integrate with Sentry, LogRocket, etc. in production)
export function logError(error: Error, context?: Record<string, any>) {
  console.error("Error occurred:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { extra: context })
  // }
}

// Error handler
export function handleError(error: unknown): NextResponse {
  // Log the error
  logError(error instanceof Error ? error : new Error(String(error)))

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string> = {}
    error.errors.forEach((err) => {
      const path = err.path.join(".")
      errors[path] = err.message
    })

    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors,
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Resource already exists",
          code: "DUPLICATE_ENTRY",
          field: error.meta?.target,
        },
        { status: 409 }
      )
    }

    // Foreign key constraint violation
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Referenced resource not found",
          code: "FOREIGN_KEY_VIOLATION",
        },
        { status: 400 }
      )
    }

    // Record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          error: "Resource not found",
          code: "NOT_FOUND",
        },
        { status: 404 }
      )
    }
  }

  // Handle custom API errors
  if (error instanceof APIError) {
    const response: any = {
      error: error.message,
      code: error.code,
    }

    if (error instanceof ValidationError && error.errors) {
      response.errors = error.errors
    }

    if (error instanceof RateLimitError && error.retryAfter) {
      return NextResponse.json(response, {
        status: error.statusCode,
        headers: {
          "Retry-After": error.retryAfter.toString(),
        },
      })
    }

    return NextResponse.json(response, { status: error.statusCode })
  }

  // Handle generic errors
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" 
        ? error instanceof Error ? error.message : String(error)
        : "An unexpected error occurred",
    },
    { status: 500 }
  )
}

// Async error wrapper
export function asyncHandler(
  handler: (req: any, params?: any) => Promise<NextResponse>
) {
  return async (req: any, params?: any) => {
    try {
      return await handler(req, params)
    } catch (error) {
      return handleError(error)
    }
  }
}

// Request validation helper
export function validateRequestBody<T>(
  body: unknown,
  schema: { safeParse: (data: unknown) => any }
): T {
  const result = schema.safeParse(body)
  if (!result.success) {
    throw result.error
  }
  return result.data
}

