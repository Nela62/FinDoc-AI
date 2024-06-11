insert into
  storage.buckets(id, name, public)
values
  (
    'saved-templates',
    'saved-templates',
    false
  );

CREATE POLICY "Give users access to SELECT own folder in Templates" ON storage.objects FOR
SELECT
  TO authenticated USING (
    bucket_id = 'saved-templates'
    AND (
      select
        auth.uid() :: text
    ) = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to INSERT own folder in Templates" ON storage.objects FOR
INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'saved-templates'
    AND (
      select
        auth.uid() :: text
    ) = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to UPDATE own folder in Templates" ON storage.objects FOR
UPDATE
  TO authenticated USING (
    bucket_id = 'saved-templates'
    AND (
      select
        auth.uid() :: text
    ) = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to DELETE own folder in Templates" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'saved-templates'
  AND (
    select
      auth.uid() :: text
  ) = (storage.foldername(name)) [1]
);