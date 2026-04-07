# Resonance Network — Feature Tracker

## In Progress

### Badges System
- [ ] Badge types: Founder, Contributor, Collaborator, etc.
- [ ] Admin can award badges from dashboard (`/admin/badges`)
- [ ] Badges display on user profiles
- [ ] Badge notifications via email
- **Status**: Table exists, admin UI started. Needs full implementation + display on profiles.

### Approval Process Improvements
- [ ] "Approve" link in notification email goes directly to admin review page
- [ ] Auto-login for admin when clicking email approve link
- [ ] One-click approve/reject from email (no multi-step navigation)
- [ ] Admin dashboard shows pending items count
- **Status**: Current flow requires manual login + navigation. Needs streamlining.

## Planned

### Domain & Infrastructure
- [x] Custom domain (resonancenetwork.org) configured
- [x] New Supabase project (dedicated to Resonance Network)
- [x] Data migration from Resonance OS project
- [ ] SSL certificate verification
- [ ] Google OAuth redirect URI update for new domain
- [ ] Password reset emails working on new domain

### Onboarding Flow (staging-join-modal branch)
- [x] Join modal with role selection
- [x] Web scraper for importing artist profiles
- [x] Profile builder preview page
- [x] Demo mode for editors (no login required to preview)
- [x] Import flow via IndexedDB
- [ ] Merge to production (awaiting approval)

### Profile & Project Pages
- [ ] Profile SEO improvements
- [ ] Project gallery drag-and-drop (implemented, needs testing)
- [ ] Profile sharing (social buttons)
- [ ] Public project pages with collaboration CTA

### Feature Requests (from users)
- [ ] (Track user-submitted feature requests here)

## Completed
- [x] User authentication (email/password)
- [x] Admin dashboard
- [x] Profile creation and editing
- [x] Project submission and review
- [x] Collaboration interest signups
- [x] Mobile responsive navigation
- [x] Contact email notifications
- [x] Onboarding flow (basic)
- [x] Migration to resonancenetwork.org
- [x] Dedicated Supabase project
