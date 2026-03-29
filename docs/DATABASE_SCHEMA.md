# Resonance Network — Database Schema Reference

**Last Updated:** 2026-03-29
**Database:** Supabase PostgreSQL (project: roshdgbppmasptzazgda, region: us-west-2)
**Connection:** Pooled via Supabase client libraries (not direct connection)

---

## Tables Overview

| # | Table | Purpose | Rows (est.) |
|---|-------|---------|-------------|
| 1 | `user_profiles` | User accounts | Core |
| 2 | `profile_extended` | Rich profile data (JSONB) | Core |
| 3 | `profile_social_links` | Social media links | Core |
| 4 | `profile_skills` | Categorized skills | Core |
| 5 | `profile_tools` | Tools & materials | Core |
| 6 | `profile_messages` | Contact form messages | Core |
| 7 | `work_experience` | Employment/education | Core |
| 8 | `portfolio_projects` | Portfolio items | Core |
| 9 | `portfolio_content_blocks` | Project content blocks | Core |
| 10 | `user_follows` | Project follows | Core |
| 11 | `user_messages` | In-app notifications | Core |
| 12 | `project_submissions` | Project proposals | Core |
| 13 | `collaboration_interest` | Collab requests | Core |
| 14 | `collaborator_profiles` | Legacy collab profiles | Legacy |
| 15 | `feature_requests` | User feature requests | New |

---

## Table Definitions

### 1. `user_profiles`

Primary user account table. References `auth.users(id)`.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK | References auth.users(id) ON DELETE CASCADE |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | Auto-updated via trigger |
| `display_name` | text | NOT NULL | |
| `email` | text | NOT NULL | |
| `avatar_url` | text | | |
| `bio` | text | | |
| `location` | text | | |
| `website` | text | | |
| `skills` | text[] | | Legacy — use profile_skills table |
| `role` | text | 'collaborator' | CHECK: collaborator, creator, admin |
| `collaborator_profile_id` | uuid | | FK → collaborator_profiles |
| `onboarding_complete` | boolean | false | |
| `profile_visibility` | text | 'draft' | CHECK: draft, pending, published |
| `welcome_email_sent` | boolean | false | Added in audit_fixes migration |

**Indexes:** `idx_user_profiles_visibility`, `idx_user_profiles_email`
**RLS:** Public read, owner insert/update, service role full access
**Triggers:** `update_updated_at_column` (before update), `handle_new_user` (after auth.users insert)

---

### 2. `profile_extended`

Rich profile data stored as individual columns + JSONB fields. One row per user.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK | References auth.users(id) ON DELETE CASCADE |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |
| `media_gallery` | jsonb | '[]' | Array of {url, alt, caption, type, order} |
| `projects` | jsonb | '[]' | Legacy project data |
| `links` | jsonb | '[]' | External links |
| `timeline` | jsonb | '[]' | Career timeline entries |
| `testimonials` | jsonb | '[]' | |
| `achievements` | text[] | '{}' | |
| `philosophy` | text | | |
| `cover_image_url` | text | | |
| `tools_and_materials` | text[] | '{}' | Legacy — use profile_tools |
| `availability_status` | text | 'open' | CHECK: open, busy, unavailable |
| `availability_note` | text | | |
| `content_blocks` | jsonb | '[]' | Block-based content |
| `pronouns` | text | | |
| `location_secondary` | text | | |
| `artist_statement` | text | | |
| `accent_color` | text | | Hex color |
| `cover_position` | jsonb | | {x, y, scale} |
| `availability_types` | text[] | '{}' | |
| `primary_website_url` | text | | |
| `primary_website_label` | text | | |
| `cta_primary_label` | text | | |
| `cta_primary_action` | text | | |
| `cta_primary_url` | text | | |
| `cta_secondary_label` | text | | |
| `cta_secondary_action` | text | | |
| `cta_secondary_url` | text | | |
| `section_order` | text[] | '{}' | |
| `section_visibility` | jsonb | | |
| `gallery_layout` | text | 'masonry' | |
| `gallery_columns` | int | 3 | |
| `resume_url` | text | | |
| `portfolio_pdf_url` | text | | |
| `media_links` | jsonb | '[]' | |
| `professional_title` | text | | |
| `past_work` | jsonb | '[]' | |
| `bio_excerpt` | text | | |
| `pdf_documents` | jsonb | '[]' | |

**Indexes:** None (PK only — single-row lookups by id)
**RLS:** Public read, owner insert/update
**Triggers:** `update_updated_at_column`

**Note:** Some columns were added multiple times with `IF NOT EXISTS` across migrations (portfolio_pdf_url, media_links, professional_title). This is harmless — PostgreSQL ignores duplicate ADD COLUMN IF NOT EXISTS.

---

### 3. `profile_social_links`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `profile_id` | uuid | NOT NULL | FK → user_profiles ON DELETE CASCADE |
| `platform` | text | NOT NULL | e.g. instagram, linkedin, behance |
| `url` | text | NOT NULL | |
| `display_order` | int | 0 | |
| `created_at` | timestamptz | now() | |

**Indexes:** `idx_profile_social_links_profile_id`
**RLS:** Public read, owner manage (ALL using profile_id = auth.uid())

---

### 4. `profile_skills`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `profile_id` | uuid | NOT NULL | FK → user_profiles ON DELETE CASCADE |
| `skill_name` | text | NOT NULL | |
| `category` | text | NOT NULL | design, architecture, fabrication, etc. |
| `display_order` | int | 0 | |
| `created_at` | timestamptz | now() | |

**Indexes:** `idx_profile_skills_profile_id`
**RLS:** Public read, owner manage

---

### 5. `profile_tools`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `profile_id` | uuid | NOT NULL | FK → user_profiles ON DELETE CASCADE |
| `tool_name` | text | NOT NULL | |
| `category` | text | NOT NULL | software, hardware, materials, processes |
| `icon_url` | text | | |
| `display_order` | int | 0 | |
| `created_at` | timestamptz | now() | |

**Indexes:** `idx_profile_tools_profile_id`
**RLS:** Public read, owner manage

---

### 6. `profile_messages`

Contact form messages sent to profile owners.

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `to_profile_id` | uuid | NOT NULL | FK → user_profiles ON DELETE CASCADE |
| `from_name` | text | NOT NULL | |
| `from_email` | text | NOT NULL | |
| `subject_type` | text | 'general' | collaboration, commission, hiring, general |
| `message` | text | NOT NULL | |
| `is_read` | boolean | false | |
| `created_at` | timestamptz | now() | |

**Indexes:** `idx_profile_messages_to_profile_id`, `idx_profile_messages_read`
**RLS:** Anyone insert, recipient read/update

---

### 7. `work_experience`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `profile_id` | uuid | | FK → user_profiles ON DELETE CASCADE |
| `type` | text | 'employment' | employment, education |
| `title` | text | NOT NULL | |
| `organization` | text | | |
| `location` | text | | |
| `start_date` | date | | |
| `end_date` | date | | |
| `is_current` | boolean | false | |
| `description` | text | | |
| `display_order` | int | 0 | |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

**Indexes:** `idx_work_experience_profile`
**RLS:** Public read (if profile published), owner manage

---

### 8. `portfolio_projects`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `profile_id` | uuid | NOT NULL | FK → user_profiles ON DELETE CASCADE |
| `title` | text | NOT NULL | |
| `slug` | text | NOT NULL | UNIQUE(profile_id, slug) |
| `tagline` | text | | |
| `description` | text | | |
| `cover_image_url` | text | | |
| `category` | text | | |
| `tags` | text[] | '{}' | |
| `role` | text | | |
| `start_date` | date | | |
| `end_date` | date | | |
| `external_links` | jsonb | '[]' | |
| `tools_used` | text[] | '{}' | |
| `display_order` | int | 0 | |
| `is_featured` | boolean | false | |
| `status` | text | 'draft' | draft, published, archived |
| `view_count` | int | 0 | |
| `appreciation_count` | int | 0 | |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

**Indexes:** `idx_portfolio_projects_profile_id`, `idx_portfolio_projects_profile_status`, `idx_portfolio_projects_slug`
**RLS:** Published readable by all + owner read all, owner insert/update/delete

---

### 9. `portfolio_content_blocks`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `project_id` | uuid | NOT NULL | FK → portfolio_projects ON DELETE CASCADE |
| `block_type` | text | NOT NULL | image, video, rich_text, quote, etc. |
| `content` | jsonb | '{}' | Block-specific data |
| `display_order` | int | 0 | |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

**Indexes:** `idx_portfolio_content_blocks_project_id`
**RLS:** Readable with project access, owner manage via project ownership

---

### 10. `user_follows`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `created_at` | timestamptz | now() | |
| `user_id` | uuid | NOT NULL | FK → auth.users ON DELETE CASCADE |
| `project_id` | text | NOT NULL | Project slug reference |

**Constraints:** UNIQUE(user_id, project_id)
**Indexes:** `idx_user_follows_user_id`
**RLS:** Owner view/insert/delete, service role full access

---

### 11. `user_messages`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `created_at` | timestamptz | now() | |
| `recipient_id` | uuid | NOT NULL | FK → auth.users ON DELETE CASCADE |
| `sender_id` | uuid | | FK → auth.users ON DELETE SET NULL |
| `sender_name` | text | | |
| `subject` | text | NOT NULL | |
| `body` | text | NOT NULL | |
| `read` | boolean | false | |
| `message_type` | text | 'notification' | CHECK: notification, collaboration_interest, project_update, system |
| `related_project` | text | | |
| `related_task` | text | | |

**Indexes:** `idx_user_messages_recipient_id`, `idx_user_messages_read`
**RLS:** Recipient view/update, service role full access

---

### 12. `project_submissions`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK | |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |
| `user_id` | uuid | | FK → auth.users ON DELETE SET NULL |
| `artist_name` | text | NOT NULL | |
| `artist_bio` | text | | |
| `artist_email` | text | NOT NULL | |
| `artist_website` | text | | |
| `artist_headshot_data` | text | | Base64 image |
| `project_title` | text | NOT NULL | |
| `one_sentence` | text | | |
| `vision` | text | | |
| `experience` | text | | |
| `story` | text | | |
| `goals` | text | | |
| `domains` | text[] | | |
| `pathways` | text[] | | |
| `stage` | text | | |
| `scale` | text | | |
| `location` | text | | |
| `materials` | text | | |
| `special_needs` | text | | |
| `hero_image_data` | text | | Base64 image |
| `gallery_images_data` | text | | Base64 images |
| `collaboration_needs` | text | | |
| `collaboration_role_count` | integer | | |
| `status` | text | 'new' | |
| `team_members` | jsonb | '[]' | |

**Indexes:** `idx_project_submissions_user_id`, `idx_project_submissions_status`
**RLS:** Service role full access, owner view/update

---

### 13. `collaboration_interest`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK | |
| `created_at` | timestamptz | now() | |
| `user_id` | uuid | | FK → auth.users ON DELETE SET NULL |
| `name` | text | NOT NULL | |
| `email` | text | NOT NULL | |
| `phone` | text | | |
| `experience` | text | NOT NULL | |
| `task_title` | text | | |
| `project_title` | text | | |
| `status` | text | 'new' | |

**Indexes:** `idx_collaboration_interest_user_id`
**RLS:** Public read, anyone insert (added in audit_fixes)

---

### 14. `collaborator_profiles` (Legacy)

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK | |
| `created_at` | timestamptz | now() | |
| `name` | text | NOT NULL | |
| `email` | text | NOT NULL | |
| `photo_url` | text | | |
| `skills` | text | NOT NULL | |
| `portfolio` | text | | |
| `availability` | text | | |
| `notes` | text | | |
| `status` | text | 'new' | |

**RLS:** Service role full access

---

### 15. `feature_requests`

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `id` | uuid | PK, gen_random_uuid() | |
| `user_id` | uuid | | FK → user_profiles ON DELETE SET NULL |
| `title` | text | NOT NULL | |
| `description` | text | | |
| `priority` | text | 'medium' | |
| `status` | text | 'new' | |
| `created_at` | timestamptz | now() | |

**Indexes:** `idx_feature_requests_user_id`
**RLS:** Owner view/insert

---

## Supabase Storage

### Bucket: `profile-uploads`
- **Access:** Public read, authenticated write
- **Path format:** `{user_id}/{type}/{timestamp}.{ext}`
- **Types:** avatar, cover, gallery, resume, portfolio, hero

---

## Client Configuration

| File | Export | Purpose | Key Type |
|------|--------|---------|----------|
| `supabase.ts` | `supabase` | Client-side (RLS) | anon key |
| `supabase.ts` | `supabaseAdmin` | Server-side (bypass RLS) | service role |
| `supabase-client.ts` | `supabase` | Client-safe (RLS) | anon key |
| `supabase-server.ts` | `createSupabaseServerClient()` | SSR with cookies | anon key + cookies |
| `supabase-auth.ts` | `createSupabaseBrowserClient()` | Browser auth | anon key |

**Connection:** All clients connect via Supabase client libraries using the project URL (`https://roshdgbppmasptzazgda.supabase.co`). This uses Supabase's built-in connection pooler (PostgREST API), not direct PostgreSQL connections. No port configuration needed.

---

## Known Issues

### Duplicate Column Additions
Migrations 20260328000004, 20260328000005, and 20260328000006 add some columns multiple times (portfolio_pdf_url, media_links, professional_title). All use `IF NOT EXISTS` so they're harmless but indicate rapid iteration.

### Naming Inconsistencies
- `is_read` (profile_messages) vs `read` (user_messages) — different column names for same concept
- `profile_id` (most tables) vs `to_profile_id` (profile_messages) — inconsistent FK naming
- `user_id` references `auth.users(id)` on some tables but `user_profiles(id)` on others (both are the same UUID, but different FK targets)

### Legacy Tables
- `collaborator_profiles` — superseded by `user_profiles` with role-based access
- `profile_extended.projects` — superseded by `portfolio_projects` table
- `profile_extended.tools_and_materials` — superseded by `profile_tools` table
- `user_profiles.skills` — superseded by `profile_skills` table
