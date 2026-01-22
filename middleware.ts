import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect dashboard and admin routes
  if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.user.email !== 'hello@fourxclub.in') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Redirect to dashboard if already signed in
  if (req.nextUrl.pathname.startsWith('/auth/signin') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/:path*'],
};