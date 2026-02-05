import { handlers } from "@/lib/auth"

console.log("📍 [ROUTE] Auth route handler loaded")

export const { GET, POST } = handlers

export const dynamic = "force-dynamic"

console.log("✅ [ROUTE] Auth handlers exported")