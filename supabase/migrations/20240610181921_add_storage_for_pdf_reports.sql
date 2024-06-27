INSERT INTO storage.buckets(id, name, public)
  VALUES ('saved-templates', 'saved-templates', FALSE);

CREATE POLICY "Give users access to SELECT own folder in Templates" ON storage.objects
  FOR SELECT TO authenticated
    USING (bucket_id = 'saved-templates'
      AND (
        SELECT
          auth.uid()::text) =(storage.foldername(name))[1]);

CREATE POLICY "Give users access to INSERT own folder in Templates" ON storage.objects
  FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'saved-templates'
    AND (
      SELECT
        auth.uid()::text) =(storage.foldername(name))[1]);

CREATE POLICY "Give users access to UPDATE own folder in Templates" ON storage.objects
  FOR UPDATE TO authenticated
    USING (bucket_id = 'saved-templates'
      AND (
        SELECT
          auth.uid()::text) =(storage.foldername(name))[1]);

CREATE POLICY "Give users access to DELETE own folder in Templates" ON storage.objects
  FOR DELETE TO authenticated
    USING (bucket_id = 'saved-templates'
      AND (
        SELECT
          auth.uid()::text) =(storage.foldername(name))[1]);

