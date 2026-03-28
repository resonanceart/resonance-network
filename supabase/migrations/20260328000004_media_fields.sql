ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS portfolio_pdf_url text;
ALTER TABLE profile_extended ADD COLUMN IF NOT EXISTS media_links jsonb DEFAULT '[]';
