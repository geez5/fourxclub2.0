import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Protected routes - manually match patterns
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/course/,
    /^\/admin/,
  ]
  return protectedPatterns.some(pattern => pattern.test(pathname))
}

// Public API routes - manually match patterns
function isPublicApiRoute(pathname: string): boolean {
  return /^\/api\/webhooks\//.test(pathname) || /^\/api\/auth\//.test(pathname)
}

// Public routes (signin, signup, home, auth callback)
function isPublicRoute(pathname: string): boolean {
  const publicPatterns = [
    /^\/$/,
    /^\/sign-in/,
    /^\/sign-up/,
    /^\/auth\//,
  ]
  return publicPatterns.some(pattern => pattern.test(pathname))
}

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const maxRequests = 100

  const key = `${ip}-${req.nextUrl.pathname}`
  const record = rateLimit.get(key)

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return null
  }

  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
    )
  }

  record.count++
  rateLimit.set(key, record)

  if (Math.random() < 0.001) {
    for (const [k, v] of rateLimit.entries()) {
      if (now > v.resetTime) rateLimit.delete(k)
    }
  }

  return null
}

export default auth((req) => {
  const { nextUrl } = req

  // Skip public routes and API routes
  if (isPublicRoute(nextUrl.pathname) || isPublicApiRoute(nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Apply rate limiting
  const rateLimitResult = applyRateLimit(req)
  if (rateLimitResult) return rateLimitResult

  // Check auth for protected routes
  if (isProtectedRoute(nextUrl.pathname)) {
    if (!req.auth) {
      const signInUrl = new URL('/auth/signin', nextUrl.origin)
      signInUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search)
      return NextResponse.redirect(signInUrl)
    }
  }

  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}