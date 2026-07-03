-- Custom SQL migration file, put your code below! --

-- Public bucket for user-uploaded assets: blog cover images, portfolio project
-- images, and attached contract PDFs. Public SELECT because these assets are
-- rendered on unauthenticated pages (blog, portfolio, /orc, /cronograma).
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "uploads_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'uploads');

CREATE POLICY "uploads_authenticated_write" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "uploads_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "uploads_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads');
