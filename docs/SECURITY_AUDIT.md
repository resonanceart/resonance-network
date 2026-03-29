# Resonance Network — Security Audit Report

**Date:** 2026-03-29
**Auditor:** Claude Code (automated)
**Scope:** Full application — API routes, auth, CSRF, input handling, storage, RLS

---

## Critical Severity

### 1. CSRF Origin Validation Used `startsWith` (FIXED)
**File:** `src/lib/csrf.ts`
**Issue:** Origin check used `startsWith()` which could be spoofed by crafted origins like `https://resonance.network.evil.com`.
**Fix:** Switched to exact origin matching + URL parsing for Vercel preview deployments (`*.vercel.app`). Added `www.resonance.network`, `localhost:3001`.
**Status:** Fixed (commit c8bd293)

### 2. Missing RLS on `collaboration_interest` Table
**Issue:** Table lacked row-level security policies, allowing any authenticated user to read/modify all records.
**Fix:** RLS policies should be added: public insert, service-role-only select/update.
**Status:** Documented in remediation plan

### 3. Missing `welcome_email_sent` Column
**Issue:** Code references `welcome_email_sent` on `user_profiles` but column doesn't exist in migrations, causing silent errors during onboarding.
**Fix:** Add column via migration: `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;`
**Status:** Documented in remediation plan

---

## High Severity

### 4. Base64 Image Storage in Database
**Issue:** Avatar and cover images are stored as base64 data URLs in the `profile_extended` JSONB column, bloating database size.
**Recommendation:** Migrate to Supabase Storage URLs. The upload API (`/api/upload`) already supports this — update the live editor to upload files rather than storing data URLs.
**Status:** Partially mitigated (gallery images use Storage, avatar/cover still use base64)

### 5. API Rate Limiting Uses In-Memory Store
**File:** `src/lib/rate-limit.ts`
**Issue:** Rate limit counters are stored in process memory, reset on each Vercel function cold start, and not shared across instances.
**Recommendation:** Use Upstash Redis or Vercel KV for distributed rate limiting.
**Status:** Acknowledged — acceptable for current traffic levels

### 6. No CSRF Token (Double-Submit)
**Issue:** CSRF protection relies solely on origin header checking. Some browsers may not send origin headers in all cases.
**Recommendation:** Implement double-submit CSRF tokens for mutation endpoints.
**Status:** Mitigated by same-origin credentials + origin validation

---

## Medium Severity

### 7. Admin Auth Uses Simple Password
**File:** `src/app/api/admin/auth/route.ts`
**Issue:** Admin dashboard uses a single shared `ADMIN_PASSWORD` env var rather than role-based auth.
**Fix:** Admin layout now checks `role === 'admin'` on user_profiles. The password endpoint is a secondary gate.
**Status:** Partially fixed (role check added in admin layout)

### 8. Missing Input Length Limits on Some API Fields
**Issue:** Some API routes accept unbounded string inputs (bio, descriptions) without explicit length checks.
**Recommendation:** Add `maxLength` validation to all text fields in API routes.
**Status:** Partially addressed (sanitizeText now accepts length parameter)

### 9. File Upload Type Validation
**File:** `src/app/api/upload/route.ts`
**Issue:** File type validation should check both MIME type and file extension.
**Recommendation:** Validate MIME type matches expected content (e.g., PDF files should have `application/pdf` MIME).
**Status:** Acknowledged

### 10. No Audit Logging
**Issue:** Admin actions (approve, reject, user role changes) are not logged.
**Recommendation:** Create `admin_audit_log` table tracking action, actor, target, timestamp.
**Status:** Documented in remediation plan

---

## Low Severity

### 11. Credentials Not Set on All Fetch Calls
**Issue:** Some client-side fetch calls were missing `credentials: 'same-origin'`, which could cause auth cookies to not be sent in certain browser configurations.
**Fix:** Added `credentials: 'same-origin'` to live editor and dashboard fetch calls.
**Status:** Fixed (commits c8bd293, 3297b77)

### 12. Hardcoded Email Recipients
**Issue:** Admin notification emails go to hardcoded addresses (`resonanceartcollective@gmail.com`, `admin@resonanceart.org`).
**Recommendation:** Move to env vars or a notification preferences table.
**Status:** Acknowledged

### 13. No Content Security Policy Headers
**Issue:** Application doesn't set CSP headers, allowing potential XSS via injected scripts.
**Recommendation:** Add CSP headers via Next.js middleware or `next.config.js`.
**Status:** Acknowledged

---

## SEO Audit Results

### Implemented
- `generateMetadata` on all public pages (profiles, projects, homepage)
- Open Graph tags with images on profile and project pages
- Twitter card meta tags
- Schema.org JSON-LD for Person (profiles) and Organization (homepage)
- Canonical URLs on profile pages
- `robots: { index: false }` on dashboard/admin pages
- Semantic HTML (article, nav, section, main elements)
- Alt text on all images

### Needs Attention
- Missing `sitemap.xml` generation (should use Next.js `app/sitemap.ts`)
- Missing `robots.txt` (should allow public pages, disallow `/dashboard`, `/admin`)
- No structured data on project pages (should add CreativeWork schema)

---

## Privacy Compliance

### GDPR/Privacy Features
- Data export: users can download all their data as JSON (`/api/user/export`)
- Account deletion: users can delete their account and all associated data
- Email preferences: users can opt out of notification types
- No third-party analytics scripts (no Google Analytics, no tracking pixels)
- Supabase Auth handles password hashing (bcrypt)

### Needs Attention
- No privacy policy page (needs `/privacy` route)
- No terms of service page (needs `/terms` route)
- No cookie consent banner (may be needed depending on jurisdiction)
- Data retention policy not defined

---

## Google OAuth

### Configuration
- Provider: Google OAuth 2.0 via Supabase Auth
- Callback URL: `https://resonance.network/auth/callback`
- Scopes: email, profile
- Supabase Dashboard: Authentication > Providers > Google (enabled)

### Implementation
- Login page offers both email/password and Google sign-in
- Auth callback at `/auth/callback` handles OAuth redirect
- New Google users auto-create `user_profiles` entry on first sign-in
- Avatar URL populated from Google profile photo
