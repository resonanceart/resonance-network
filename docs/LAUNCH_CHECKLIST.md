# Resonance Network — Pre-Launch Checklist

**Last Updated:** 2026-03-29

---

## Core Features

- [x] User sign-up and login (email/password)
- [x] Google OAuth sign-in
- [x] Onboarding wizard (welcome page)
- [x] Profile live editor (avatar, cover, bio, skills, tools, gallery, timeline, past work)
- [x] Profile preview page
- [x] Profile submission for review
- [x] Public profile pages with tab navigation (Work, About, Timeline, Gallery)
- [x] Portfolio project pages with content blocks
- [x] Portfolio project editor (new/edit with block editor)
- [x] Project submission system
- [x] Project live editor with preview
- [x] Collaboration roles and interest forms
- [x] Contact form on profiles
- [x] SmartGallery (images, PDFs, links with drag-reorder)
- [x] Work experience editor
- [x] Social links management
- [x] Feature request system
- [x] User dashboard with completion checklist and action cards

## Admin Dashboard

- [x] Admin layout with sidebar navigation
- [x] Admin auth guard (role-based access)
- [x] Review queue (pending profiles and projects)
- [x] User management
- [x] Project management
- [x] Profile management
- [ ] Activity log / audit trail
- [ ] Site health monitoring
- [ ] Announcements system
- [x] Feature requests viewer

## Security

- [x] CSRF validation with exact origin matching
- [x] Vercel preview deployment support in CSRF
- [x] Input sanitization on all API routes
- [x] Rate limiting on API endpoints
- [x] RLS policies on core tables (user_profiles, profile_extended, skills, tools, social_links)
- [x] File upload size limits (5MB avatar, 10MB cover/gallery)
- [x] File type validation on uploads
- [x] Credentials: same-origin on all client fetch calls
- [ ] Add RLS to collaboration_interest table
- [ ] Add welcome_email_sent column
- [ ] Add database indexes on foreign keys
- [ ] Content Security Policy headers
- [ ] Distributed rate limiting (Redis/KV)

## SEO

- [x] generateMetadata on all public pages
- [x] Open Graph tags with images
- [x] Twitter card meta tags
- [x] Schema.org JSON-LD on profiles
- [x] Canonical URLs on profiles
- [x] robots noindex on dashboard/admin
- [x] Semantic HTML throughout
- [ ] sitemap.xml generation
- [ ] robots.txt file
- [ ] Schema.org on project pages

## Privacy & Compliance

- [x] Data export (JSON download)
- [x] Account deletion
- [x] Email preference management
- [x] No third-party tracking
- [ ] Privacy policy page (/privacy)
- [ ] Terms of service page (/terms)
- [ ] Cookie consent (if applicable)

## Email Notifications

- [x] Welcome email on sign-up
- [x] Profile submission confirmation
- [x] Admin notification on new submissions
- [x] Approval/rejection notifications to users
- [x] Collaboration interest notifications
- [x] Contact form notifications
- [x] Feature request admin notification
- [ ] Email delivery monitoring

## Infrastructure

- [x] Vercel hosting with auto-deploy from GitHub
- [x] Supabase PostgreSQL database
- [x] Supabase Auth (email + Google OAuth)
- [x] Supabase Storage for file uploads
- [x] Gmail API for email sending
- [x] Custom domain (resonance.network)
- [ ] Error monitoring (Sentry or similar)
- [ ] Uptime monitoring
- [ ] Database backup verification

## Design & UX

- [x] Dark/light theme support via CSS variables
- [x] Mobile-responsive layout (all pages)
- [x] Accessibility: focus indicators, ARIA labels, semantic HTML
- [x] Loading states on all async operations
- [x] Error states with user-friendly messages
- [x] Empty states with CTAs
- [x] Consistent design system (tokens in globals.css)

---

## Launch Blockers (Must Fix)

1. Add RLS policies to `collaboration_interest` table
2. Add `welcome_email_sent` column to `user_profiles`
3. Create `/privacy` and `/terms` pages (even placeholder)
4. Generate `sitemap.xml` and `robots.txt`

## Post-Launch Priority

1. Add database indexes on foreign keys
2. Implement admin audit logging
3. Migrate avatar/cover from base64 to Storage URLs
4. Add Content Security Policy headers
5. Set up error monitoring (Sentry)
6. Add distributed rate limiting
