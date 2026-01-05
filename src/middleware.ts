import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Rate limiting store (in production, use Redis)
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/videos(.*)',
  '/api/referrals(.*)',
  '/api/user(.*)',
  '/api/discord/link(.*)',
])

// Public API routes (webhooks)
const isPublicApiRoute = createRouteMatcher([
  '/api/webhooks/(.*)',
])

interface RateLimitRecord {
    count: number
    resetTime: number
}

export default clerkMiddleware((auth, req: NextRequest) => {
    // Skip middleware for public API routes
    if (isPublicApiRoute(req)) {
        return NextResponse.next()
    }
    
    // Apply rate limiting
    const rateLimitResult: NextResponse | null = applyRateLimit(req)
    if (rateLimitResult) {
        return rateLimitResult
    }
    
    // Protect routes
    if (isProtectedRoute(req)) {
        auth().protect()
    }
    
    // Add security headers
    const response: NextResponse = NextResponse.next()
    
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // CORS for API routes only
    if (req.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL!)
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    
    return response
})

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') || 
            req.headers.get('x-real-ip') || 
            'unknown'
  
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100
  
  const key = `${ip}-${req.nextUrl.pathname}`
  const record = rateLimit.get(key)
  
  if (!record || now > record.resetTime) {
    // Create new record
    rateLimit.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    return null
  }
  
  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
    )
  }
  
  // Increment count
  record.count++
  rateLimit.set(key, record)
  
  // Clean up old records every 1000 requests
  if (Math.random() < 0.001) {
    for (const [k, v] of rateLimit.entries()) {
      if (now > v.resetTime) {
        rateLimit.delete(k)
      }
    }
  }
  
  return null
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}