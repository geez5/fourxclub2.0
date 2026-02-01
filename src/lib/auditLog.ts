import { supabaseAdmin } from './supabase/index'

export async function logAudit(
  action: string,
  userId: string,
  metadata: Record<string, unknown>,
  req: Request
) {
  const ip = req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown'

  await supabaseAdmin
    .from('audit_logs')
    .insert({
      action,
      user_id: userId,
      metadata,
      ip_address: ip,
      created_at: new Date().toISOString()
    })
}