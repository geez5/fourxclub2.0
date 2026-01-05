import { createClient } from '@supabase/supabase-js'

// Public client (for frontend)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Admin client (for API routes - bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Set current user context for RLS
export async function setUserContext(clerkId: string) {
  await supabaseAdmin.rpc('set_config', {
    setting: 'app.current_user_clerk_id',
    value: clerkId
  })
}