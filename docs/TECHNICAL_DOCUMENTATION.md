# Resonance Network — Technical Documentation

## Platform Overview
Resonance Network is a curated platform connecting creators of immersive and regenerative spatial projects with aligned collaborators. Built with Next.js 14 (App Router), Supabase (PostgreSQL + Auth + Storage), TypeScript, and React 18.

**Live URL:** https://resonance.network
**Vercel Project:** resonance-network
**Supabase Project:** roshdgbppmasptzazgda (us-west-2)

---

## Architecture

### Tech Stack
- **Frontend:** Next.js 14 App Router, React 18, TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)
- **Storage:** Supabase Storage (bucket: `profile-uploads`)
- **Email:** Gmail API via nodemailer
- **Hosting:** Vercel (auto-deploy from GitHub main branch)
- **CSS:** Custom CSS (no framework) — `globals.css`, `components.css`, `admin.css`

### Key Directories
```
src/
├── app/
│   ├── admin/          # Admin command center
│   ├── api/            # API routes
│   │   ├── admin/      # Admin auth, approve, users
│   │   ├── profiles/   # Profile CRUD
│   │   ├── submit-project/ # Project submission
│   │   ├── upload/     # File uploads to Supabase Storage
│   │   └── user/       # User profile, projects, messages
│   ├── dashboard/      # User dashboard
│   │   ├── profile/    # Profile editor + preview
│   │   └── projects/   # Project editor + preview
│   ├── profiles/       # Public profile pages
│   └── projects/       # Public project pages
├── components/
│   ├── profile/        # Profile components (SmartGallery, etc.)
│   ├── dashboard/      # Dashboard components
│   └── ui/             # Shared UI components
├── lib/                # Utilities (supabase, sanitize, email, etc.)
├── styles/             # CSS files
└── types/              # TypeScript type definitions
```

---

## Database Schema

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user_profiles` | User accounts | id, display_name, email, avatar_url, bio, skills[], role, profile_visibility |
| `profile_extended` | Rich profile data | media_gallery, timeline, philosophy, cover_image_url, pdf_documents, media_links |
| `project_submissions` | Project submissions | project_title, artist_name, hero_image_data, gallery_images_data, status, team_members |
| `profile_skills` | Categorized skills | skill_name, category, display_order |
| `profile_tools` | Tools/materials | tool_name, category, display_order |
| `profile_social_links` | Social media links | platform, url, display_order |
| `work_experience` | Employment/education | type, title, organization, start_date, end_date |
| `portfolio_projects` | Portfolio items | title, slug, description, cover_image_url, status |
| `profile_messages` | Contact form messages | from_name, from_email, subject_type, message |
| `user_messages` | In-app notifications | recipient_id, subject, body, message_type |
| `collaboration_interest` | Collaboration requests | name, email, task_title, project_title |
| `feature_requests` | User feature requests | title, description, priority, status |

### Storage Buckets
- `profile-uploads` — Public read, authenticated write. Stores avatars, covers, gallery images, PDFs.
  - Path format: `{user_id}/{type}/{timestamp}.{ext}`
  - Types: avatar, cover, gallery, resume, portfolio, hero

### RLS Policies
- User profiles: public read, owner update/insert
- Profile extended: via profile_extended RLS (owner only write)
- Skills/tools/social links: public read, owner manage
- Messages: anyone insert, recipient read/update
- Project submissions: service role access (managed via API)

---

## User Workflows

### 1. Sign Up Flow
```
Homepage → /login (signup tab) → Email confirmation → /auth/callback
→ /dashboard → /dashboard/welcome (enter name) → /dashboard/profile/live-edit
```

### 2. Profile Building
```
/dashboard/profile/live-edit → Edit sections (avatar, cover, bio, skills, gallery)
→ Save All Changes (PUT /api/user/profile) → Preview (/dashboard/profile/preview)
→ Submit for Review (sets profile_visibility='pending', sends email)
→ Admin approves (sets profile_visibility='published')
→ Profile live at /profiles/[slug]
```

### 3. Project Submission
```
/dashboard/projects/live-edit → Fill in project details + gallery + team + roles
→ Save Draft (POST /api/submit-project, status='draft')
→ Preview (/dashboard/projects/preview?id=ID)
→ Submit for Review (POST /api/submit-project, status='pending' → stored as 'new')
→ Admin approves (POST /api/admin/approve, status='approved')
→ Project live at /projects/[slug]
```

### 4. Admin Review
```
/admin → Login (auto-auth for admin role users)
→ Review Queue (pending profiles + new projects)
→ Click Preview → View full submission
→ Approve/Reject → Email notification sent to user
→ Content goes live (or user gets rejection feedback)
```

---

## API Routes

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/user/profile` | GET | Get current user's profile | Required |
| `/api/user/profile` | PUT | Update profile | Required |
| `/api/user/projects` | GET | Get user's project submissions | Required |
| `/api/submit-project` | POST | Create/update project submission | Required |
| `/api/upload` | POST | Upload file to Supabase Storage | Required |
| `/api/profiles/[slug]` | GET | Get public profile by slug | Public |
| `/api/profiles/[slug]/contact` | POST | Send contact message | Rate-limited |
| `/api/admin/approve` | POST | Approve/reject submissions | Admin |
| `/api/admin/auth` | POST | Admin password authentication | Public |
| `/api/admin/users` | GET/PUT | Manage users | Admin |
| `/api/feature-requests` | GET/POST | Feature request CRUD | Required |

---

## Key Components

### SmartGallery (`src/components/profile/SmartGallery.tsx`)
Unified media gallery supporting images, PDFs, and links. Used in:
- Profile live editor (editable mode)
- Profile preview (read-only)
- Public profile page (via ProfileSmartGallery wrapper)
- Project editor (editable mode)

Features: drag-to-reorder, delete, edit title, edit thumbnail, hover zoom effects.

### ProfileChecklist (`src/components/profile/ProfileChecklist.tsx`)
Floating widget showing profile completion progress. Always visible in editor.

### ShareProfile (`src/components/profile/ShareProfile.tsx`)
Social sharing buttons (Twitter/X, LinkedIn, Facebook, Copy Link) for published profiles.

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `ADMIN_PASSWORD` | Admin dashboard password |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail app password |

---

## Known Issues & Remediation Plan

### Critical (Fix before launch)
1. Missing `welcome_email_sent` column on user_profiles
2. Missing RLS policies on collaboration_interest table
3. Missing database indexes on frequently queried foreign keys

### Medium (Fix soon after launch)
4. Admin approval audit logging (who approved what, when)
5. URL validation for social/custom links
6. Better error messages in API responses
7. Pagination for admin data tables

### Low (Technical debt)
8. Duplicate migration columns (cosmetic, no functional impact)
9. Dead code cleanup (legacy components)
10. Performance optimization (memoize expensive computations)
