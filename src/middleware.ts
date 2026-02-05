import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth } = NextAuth(authConfig);

// Optional: rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 100;

  const key = `${ip}-${req.nextUrl.pathname}`;
  const record = rateLimit.get(key);

  if (!record || now > record.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((record.resetTime - now) / 1000)
          ),
        },
      }
    );
  }

  record.count++;
  rateLimit.set(key, record);
  return null;
}

export default auth(async (req) => {
  const { nextUrl } = req;

  // Skip static assets
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Optional rate limit
  // const rateLimitResult = applyRateLimit(req);
  // if (rateLimitResult) return rateLimitResult;

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/health|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
