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
