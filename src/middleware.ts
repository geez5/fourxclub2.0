import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Protected routes - manually match patterns
function isProtectedRoute(pathname: string): boolean {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/api\/videos/,
    /^\/api\/referrals/,
    /^\/api\/user/,
    /^\/api\/discord\/link/,
  ]
  return protectedPatterns.some(pattern => pattern.test(pathname))
}

// Public API routes - manually match patterns
function isPublicApiRoute(pathname: string): boolean {
  return /^\/api\/webhooks\//.test(pathname)
}

// Public routes (signin, signup, home, auth callback)
function isPublicRoute(pathname: string): boolean {
  const publicPatterns = [
    /^\/$/,
    /^\/sign-in/,
    /^\/sign-up/,
    /^\/auth\//,
    /^\/api\/auth\//,
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

export async function middleware(req: NextRequest) {
  // Skip public routes
  if (isPublicRoute(req.nextUrl.pathname) || isPublicApiRoute(req.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Apply rate limiting
  const rateLimitResult = applyRateLimit(req)
  if (rateLimitResult) return rateLimitResult

  let response = NextResponse.next()

  // Check auth for protected routes
  if (isProtectedRoute(req.nextUrl.pathname)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      const signInUrl = new URL('/auth/signin', req.nextUrl.origin)
      signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  // CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    response.headers.set('Access-Control-Allow-Origin', siteUrl)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}