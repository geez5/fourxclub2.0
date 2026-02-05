import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// Force dynamic to prevent static generation issues
export const dynamic = "force-dynamic"