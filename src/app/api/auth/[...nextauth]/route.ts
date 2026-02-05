import { handlers } from "@/lib/auth"

console.log("✅ Auth Route Handlers initialized");

export const { GET, POST } = handlers;

// Ensure the route is dynamic to prevent static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';