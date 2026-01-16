import { supabaseAdmin } from './supabase'

export async function logAudit(
  action: string,
  userId?: string,
  details?: any,
  request?: Request
) {
  const ipAddress = request?.headers.get('x-forwarded-for') || 
                   request?.headers.get('x-real-ip') || 
                   'unknown'
  
  const userAgent = request?.headers.get('user-agent') || 'unknown'
  
  await supabaseAdmin.from('audit_logs').insert({
    user_id: userId || null,
    action,
    details: details || {},
    ip_address: ipAddress,
    user_agent: userAgent
  })
}