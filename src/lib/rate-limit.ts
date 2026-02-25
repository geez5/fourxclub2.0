import { NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

// General limiter: 100 requests per 15 minutes per IP
const generalLimiter = new RateLimiterMemory({
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
    duration: Math.floor(
        parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10) / 1000
    ),
});

// Strict limiter: 10 requests per 15 minutes per IP (payments, auth)
const strictLimiter = new RateLimiterMemory({
    points: 10,
    duration: 900, // 15 minutes
});

type LimiterType = "general" | "strict";

function getClientIp(req: Request): string {
    // Vercel / reverse proxy passes client IP in x-forwarded-for
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    // Fallback — should not happen on Vercel but covers local dev
    return "127.0.0.1";
}

/**
 * Apply rate limiting to an API request.
 * Returns a 429 NextResponse if the limit is exceeded, or `null` if the request is allowed.
 *
 * Usage:
 * ```ts
 * const limited = await applyRateLimit(req, "general");
 * if (limited) return limited;
 * ```
 */
export async function applyRateLimit(
    req: Request,
    type: LimiterType = "general"
): Promise<NextResponse | null> {
    const limiter = type === "strict" ? strictLimiter : generalLimiter;
    const ip = getClientIp(req);

    try {
        const result = await limiter.consume(ip);

        // Optionally, you could set headers on successful requests too,
        // but returning null lets the caller proceed normally.
        return null;
    } catch (rejRes: any) {
        // rejRes is a RateLimiterRes when the limit is exceeded
        const retryAfter = Math.ceil((rejRes.msBeforeNext || 1000) / 1000);

        return NextResponse.json(
            {
                error: "Too many requests. Please try again later.",
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(retryAfter),
                    "X-RateLimit-Limit": String(limiter.points),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": new Date(
                        Date.now() + (rejRes.msBeforeNext || 1000)
                    ).toISOString(),
                },
            }
        );
    }
}
