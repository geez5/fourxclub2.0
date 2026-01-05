(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@clerk/nextjs/server'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
// Rate limiting store (in production, use Redis)
const rateLimit = new Map();
// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/api/videos(.*)',
    '/api/referrals(.*)',
    '/api/user(.*)',
    '/api/discord/link(.*)'
]);
// Public API routes (webhooks)
const isPublicApiRoute = createRouteMatcher([
    '/api/webhooks/(.*)'
]);
const __TURBOPACK__default__export__ = clerkMiddleware((auth, req)=>{
    // Skip middleware for public API routes
    if (isPublicApiRoute(req)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Apply rate limiting
    const rateLimitResult = applyRateLimit(req);
    if (rateLimitResult) {
        return rateLimitResult;
    }
    // Protect routes
    if (isProtectedRoute(req)) {
        auth().protect();
    }
    // Add security headers
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // CORS for API routes only
    if (req.nextUrl.pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', ("TURBOPACK compile-time value", "https://fourxclub.in"));
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    return response;
});
function applyRateLimit(req) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000 // 15 minutes
    ;
    const maxRequests = 100;
    const key = `${ip}-${req.nextUrl.pathname}`;
    const record = rateLimit.get(key);
    if (!record || now > record.resetTime) {
        // Create new record
        rateLimit.set(key, {
            count: 1,
            resetTime: now + windowMs
        });
        return null;
    }
    if (record.count >= maxRequests) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Too many requests. Please try again later.'
        }, {
            status: 429,
            headers: {
                'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
            }
        });
    }
    // Increment count
    record.count++;
    rateLimit.set(key, record);
    // Clean up old records every 1000 requests
    if (Math.random() < 0.001) {
        for (const [k, v] of rateLimit.entries()){
            if (now > v.resetTime) {
                rateLimit.delete(k);
            }
        }
    }
    return null;
}
const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map