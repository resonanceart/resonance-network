# Resonance Network — Scaling Advisory
## Technical Infrastructure Roadmap

### Current Stack
- Next.js 14 (App Router) on Vercel
- Supabase (PostgreSQL + Auth + Storage) on AWS us-west-2
- Custom CSS, no component library
- Gmail API for transactional email

---

## Scaling Tiers

### Tier 1: Now → 1,000 Users
**Current infrastructure is sufficient.** Focus on:
- ISR caching (`revalidate: 60`) for public pages ✅ (already implemented)
- Image resize on upload via Supabase Storage ✅ (using /api/upload)
- Basic error monitoring (add Sentry)
- Database indexes on foreign keys ✅ (added in audit)

### Tier 2: 1,000 → 10,000 Users
- **Add Upstash Redis** for session caching and rate limiting
- **Add Typesense** for full-text search across profiles and projects
- **Add background job processing** (Inngest or Trigger.dev) for email, image processing
- **Upgrade Supabase** to Pro plan for connection pooling and larger database
- **Add PostHog** for product analytics and feature flags

### Tier 3: 10,000 → 100,000 Users
- **Add Cloudflare** for CDN, DDoS protection, bot management
- **Add dedicated image CDN** (Cloudinary or Imgix)
- **Database read replicas** via Supabase Pro
- **Content moderation pipeline** with automated screening
- **Dedicated search infrastructure** with ML-based ranking

---

## Database Optimization

### Current Indexes (Applied)
- `idx_project_submissions_user_id`
- `idx_collaboration_interest_user_id`
- `idx_user_messages_recipient_id`
- `idx_profile_messages_to_profile`
- `idx_profile_skills_profile_id`
- `idx_profile_tools_profile_id`
- `idx_profile_social_links_profile_id`

### Recommended Additional Indexes
- `CREATE INDEX CONCURRENTLY idx_user_profiles_slug ON user_profiles(lower(display_name))` — for profile lookup by slug
- `CREATE INDEX CONCURRENTLY idx_project_submissions_status ON project_submissions(status)` — for admin filtering
- GIN index on `profile_extended.media_gallery` for JSONB queries

### Query Optimization
- Profile page currently makes 5-7 queries (user_profiles + profile_extended + skills + tools + social_links + work_experience + portfolio_projects)
- Recommendation: Use Supabase's PostgREST relationship syntax to reduce to 1-2 queries
- Add `LIMIT 1000` to all list queries to prevent unbounded results ✅ (added in audit)

---

## Image Pipeline

### Current State
- Images upload to Supabase Storage via `/api/upload`
- No resize on upload — originals stored directly
- Served via Supabase CDN with cache headers

### Recommended Pipeline
1. Accept upload → store original in `originals/` prefix
2. Background job generates 3 variants: thumbnail (300px), preview (1200px), full (2400px)
3. Store variants in `variants/` prefix
4. Serve via Supabase CDN or Cloudflare Images
5. Use `next/image` with Supabase domain in remotePatterns ✅ (already configured)

---

## Search Strategy

### Phase 1 (Current): PostgreSQL full-text search
- Use `pg_trgm` for fuzzy name/title matching
- Simple `ILIKE` queries for tag search
- Adequate for < 5,000 profiles/projects

### Phase 2: Dedicated search (Typesense)
- Sync profiles and projects to Typesense index
- Faceted search by domain, pathway, stage, location, skills
- Typo-tolerant, instant results
- Self-hosted ($0) or Typesense Cloud ($29/mo)

### Phase 3: ML-powered recommendations
- CLIP embeddings for visual similarity
- Collaborative filtering for "artists who liked this"
- Graph-based recommendations from social connections

---

## Monetization Roadmap

### Phase 1: Free platform (current)
- Build critical mass of quality profiles and projects
- Focus on artist acquisition and content quality

### Phase 2: Pro tier ($8-15/month)
- Custom domain for profiles
- Remove Resonance branding
- Profile analytics (who viewed, where from)
- Priority in search results

### Phase 3: Commission marketplace
- Organizations post calls for artists (RFPs)
- Artists respond with proposals
- Facilitation fee on successful connections (10-15%)

### Phase 4: Job board
- Companies pay to post collaboration opportunities ($299-499/listing)
- Featured placement for premium listings

---

## Security Roadmap

### Applied ✅
- Hashed IPs in rate limiter
- Admin route protection in middleware
- CSRF validation on state-changing endpoints
- Content Security Policy headers
- Supabase RLS policies on all user-facing tables
- File upload validation (size + MIME type)

### Planned
- DOMPurify for XSS prevention on user HTML content
- Sentry for error monitoring
- Admin action audit logging
- Automated content screening for uploads
- DMARC/SPF/DKIM for email domain authentication

---

## Monitoring & Observability

### Recommended Stack
1. **Sentry** — Error tracking (free tier: 5K errors/month)
2. **PostHog** — Product analytics + feature flags (free tier: 1M events/month)
3. **Better Stack** — Uptime monitoring (free tier: 10 monitors)
4. **Supabase Dashboard** — Database metrics, storage usage, auth analytics

### Key Metrics to Track
- Sign-up → Profile Complete conversion rate
- Profile Complete → Project Submitted conversion rate
- Average page load time
- API error rate
- Storage usage growth rate
- Email deliverability rate

---

## Frontend Audit Findings (March 2026)

### SEO & Metadata Coverage

| Page | Title | Description | OG Tags | Canonical | Status |
|------|-------|-------------|---------|-----------|--------|
| Home (`/`) | ✓ | ✓ | ✓ | ✓ | Complete |
| About | ✓ | ✓ | ✓ | ✓ | Complete |
| Collaborate | ✓ | ✓ | ✓ | ✓ | Complete |
| Profiles/[slug] | ✓ dynamic | ✓ | ✓ | ✓ | Complete |
| Projects/[slug] | ✓ dynamic | ✓ | ✓ | ✓ | Complete |
| Join | ✓ | ✓ | ✓ | ✓ | Complete |
| Login | ✓ | ✓ | ✓ | — | Fixed (layout.tsx) |
| Reset Password | ✓ | ✓ | — | — | Fixed (layout.tsx) |
| Privacy | ✓ | ✓ | ✓ | ✓ | Fixed (added OG) |
| Terms | ✓ | ✓ | ✓ | ✓ | Fixed (added OG) |
| Resources | ✓ | ✓ | ✓ | ✓ | Fixed (added OG) |

### Accessibility Compliance
- ✓ Skip navigation link in global layout
- ✓ Main content landmark (`id="main-content"`)
- ✓ HTML `lang="en"` attribute
- ✓ All form inputs have associated `<label>` elements
- ✓ Decorative SVGs marked `aria-hidden="true"`
- ✓ Proper heading hierarchy (H1 → H2 → H3) on all pages
- ✓ Focus states on interactive elements via CSS

### Internal Link Fixes
- Home page: Changed `<a href="/collaborate">` to `<Link href="/collaborate">` (client-side navigation)
- Terms page: Changed `<a href="/privacy">` to `<Link href="/privacy">`

### CSS Architecture
- Total: ~14,200 lines across `components.css` + `admin.css`
- **Recommendation**: Split `components.css` into route-scoped modules
  - `globals.css` — tokens, reset, typography (~500 lines)
  - `layout.css` — header, footer, navigation (~800 lines)
  - `profile.css` — profile pages and editors (~4,000 lines)
  - `project.css` — project pages and gallery (~2,000 lines)
  - `dashboard.css` — dashboard components (~2,000 lines)
  - `forms.css` — shared form and input styles (~1,000 lines)
  - `admin.css` — admin-only styles (~1,000 lines, already separate)

### Performance Recommendations
1. **Critical**: Migrate base64 images from PostgreSQL to Supabase Storage
2. **High**: Add `loading="lazy"` to below-fold images
3. **Medium**: Code-split dashboard components with `dynamic()` imports
4. **Medium**: Add `<link rel="preconnect">` for Supabase API domain
5. **Low**: Enable Brotli compression on Vercel (automatic)

### Revenue Projection at Scale

| Users | Free (82%) | Pro 15% @ $12/mo | Studio 3% @ $39/mo | Monthly |
|-------|-----------|-------------------|---------------------|---------|
| 1,000 | 820 | 150 → $1,800 | 30 → $1,170 | **$2,970** |
| 5,000 | 4,100 | 750 → $9,000 | 150 → $5,850 | **$14,850** |
| 10,000 | 8,200 | 1,500 → $18,000 | 300 → $11,700 | **$29,700** |
| 50,000 | 41,000 | 7,500 → $90,000 | 1,500 → $58,500 | **$148,500** |

---

*Prepared as part of a comprehensive frontend audit of the Resonance Network platform.
Findings reflect the codebase state as of March 2026.*
