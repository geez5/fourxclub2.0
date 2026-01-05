import { createHash, randomBytes } from 'crypto'
import { supabaseAdmin } from './supabase'

// Generate secure video access token
export async function generateVideoToken(
  userId: string,
  videoNumber: number
): Promise<string> {
  // Create unique token
  const token = randomBytes(32).toString('hex')
  
  // Hash token for storage
  const hashedToken = createHash('sha256')
    .update(token + process.env.VIDEO_TOKEN_SECRET!)
    .digest('hex')
  
  // Store in database with 2 hour expiry
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  
  await supabaseAdmin.from('video_access_tokens').insert({
    user_id: userId,
    video_number: videoNumber,
    token: hashedToken,
    expires_at: expiresAt.toISOString()
  })
  
  return token
}

// Verify video token
export async function verifyVideoToken(
  token: string,
  videoNumber: number
): Promise<{ valid: boolean; userId?: string }> {
  // Hash provided token
  const hashedToken = createHash('sha256')
    .update(token + process.env.VIDEO_TOKEN_SECRET!)
    .digest('hex')
  
  // Check database
  const { data, error } = await supabaseAdmin
    .from('video_access_tokens')
    .select('user_id, expires_at')
    .eq('token', hashedToken)
    .eq('video_number', videoNumber)
    .single()
  
  if (error || !data) {
    return { valid: false }
  }
  
  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    // Delete expired token
    await supabaseAdmin
      .from('video_access_tokens')
      .delete()
      .eq('token', hashedToken)
    
    return { valid: false }
  }
  
  return { valid: true, userId: data.user_id }
}

// Clean up expired tokens (call this daily via cron)
export async function cleanupExpiredTokens() {
  await supabaseAdmin.rpc('cleanup_expired_tokens')
}