import { randomBytes } from 'crypto'

/**
 * Generate a URL-safe random token for claim links.
 *
 * 24 random bytes encoded as base64url yields a 32-character string
 * containing only [A-Za-z0-9\-_] (no padding). 192 bits of entropy is
 * well above the bar for an unguessable single-use invitation token.
 */
export function generateClaimToken(): string {
  return randomBytes(24).toString('base64url')
}
