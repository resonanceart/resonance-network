-- Add DELETE RLS policy so users can delete their own project submissions
-- This was missing after SEC-8 dropped the permissive "service role full access" policy
CREATE POLICY "Users can delete own project submissions"
  ON project_submissions
  FOR DELETE
  USING (auth.uid() = user_id);
