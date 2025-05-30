import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export interface SecurityOptions {
  maxRequestSize?: number
  enableCSRF?: boolean
  allowedOrigins?: string[]
  enableRateLimit?: boolean
  maxRequestsPerMinute?: number
}

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Security middleware to protect against common attacks
 */
export function withSecurity(options: SecurityOptions = {}) {
  return function securityMiddleware<T extends any[]>(
    handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
      try {
        // Check request size
        if (options.maxRequestSize) {
          const contentLength = req.headers.get('content-length')
          if (contentLength && parseInt(contentLength) > options.maxRequestSize) {
            return NextResponse.json(
              { error: 'Request too large' },
              { status: 413 }
            )
          }
        }

        // CORS protection
        if (options.allowedOrigins) {
          const origin = req.headers.get('origin')
          if (origin && !options.allowedOrigins.includes(origin)) {
            return NextResponse.json(
              { error: 'Origin not allowed' },
              { status: 403 }
            )
          }
        }

        // Rate limiting
        if (options.enableRateLimit) {
          const rateLimitResult = checkRateLimit(req, options.maxRequestsPerMinute || 60)
          if (!rateLimitResult.allowed) {
            return NextResponse.json(
              { 
                error: 'Rate limit exceeded',
                retryAfter: rateLimitResult.retryAfter 
              },
              { 
                status: 429,
                headers: {
                  'Retry-After': rateLimitResult.retryAfter.toString(),
                  'X-RateLimit-Limit': (options.maxRequestsPerMinute || 60).toString(),
                  'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
                  'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                }
              }
            )
          }
        }

        // CSRF protection for state-changing methods
        if (options.enableCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          const csrfResult = checkCSRF(req)
          if (!csrfResult.valid) {
            return NextResponse.json(
              { error: 'CSRF token invalid or missing' },
              { status: 403 }
            )
          }
        }

        // Content type validation
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const contentType = req.headers.get('content-type')
          if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
              { error: 'Content-Type must be application/json' },
              { status: 400 }
            )
          }
        }

        // Proceed with the original handler
        const response = await handler(req, ...args)

        // Add security headers to response
        addSecurityHeaders(response)

        return response
      } catch (error) {
        console.error('Security middleware error:', error)
        return NextResponse.json(
          { error: 'Security validation failed' },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Check rate limiting for the request
 */
function checkRateLimit(req: NextRequest, maxRequests: number): {
  allowed: boolean
  remaining: number
  retryAfter: number
  resetTime: number
} {
  const clientId = getClientId(req)
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window

  const clientData = rateLimitStore.get(clientId)
  
  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfter: 0,
      resetTime: now + windowMs
    }
  }

  if (clientData.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      resetTime: clientData.resetTime
    }
  }

  // Increment count
  clientData.count++
  rateLimitStore.set(clientId, clientData)

  return {
    allowed: true,
    remaining: maxRequests - clientData.count,
    retryAfter: 0,
    resetTime: clientData.resetTime
  }
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(req: NextRequest): string {
  // In production, you might want to use a more sophisticated approach
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown'
  return ip
}

/**
 * Check CSRF token
 */
function checkCSRF(req: NextRequest): { valid: boolean } {
  // For API routes, we can use the Origin header approach
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  
  if (!origin || !host) {
    return { valid: false }
  }

  // Allow same-origin requests
  try {
    const originUrl = new URL(origin)
    return { valid: originUrl.host === host }
  } catch {
    return { valid: false }
  }
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy for API responses
  response.headers.set('Content-Security-Policy', "default-src 'none'")
  
  // Remove server information
  response.headers.delete('server')
  response.headers.delete('x-powered-by')
}

/**
 * Validate request body size and structure
 */
export function validateRequestBody(body: any): { valid: boolean; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Request body must be a valid JSON object' }
  }

  // Check for prototype pollution attempts
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']
  const checkObject = (obj: any, path = ''): boolean => {
    if (typeof obj !== 'object' || obj === null) return true
    
    for (const key in obj) {
      if (dangerousKeys.includes(key)) {
        return false
      }
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!checkObject(obj[key], `${path}.${key}`)) {
          return false
        }
      }
    }
    return true
  }

  if (!checkObject(body)) {
    return { valid: false, error: 'Request contains potentially dangerous keys' }
  }

  return { valid: true }
}

/**
 * Sanitize request headers
 */
export function sanitizeHeaders(req: NextRequest): Record<string, string> {
  const allowedHeaders = [
    'content-type',
    'authorization',
    'user-agent',
    'accept',
    'accept-language',
    'cache-control',
  ]

  const sanitized: Record<string, string> = {}
  
  for (const [key, value] of req.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      // Remove null bytes and control characters
      const cleanValue = value.replace(/[\x00-\x1F\x7F]/g, '')
      if (cleanValue.length <= 1000) { // Prevent header bombing
        sanitized[key] = cleanValue
      }
    }
  }

  return sanitized
}