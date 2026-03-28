-- Create storage bucket for profile and project uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-uploads',
  'profile-uploads',
  true,
  52428800, -- 50MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-uploads');

-- Allow users to update/overwrite their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
