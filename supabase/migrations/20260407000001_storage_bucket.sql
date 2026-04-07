-- Create the profile-uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-uploads',
  'profile-uploads',
  true,
  10485760, -- 10MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'image/bmp', 'image/tiff',
    'image/svg+xml', 'image/avif', 'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update/replace their own files
CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (bucket is public)
CREATE POLICY "Public read access for profile uploads"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-uploads');
