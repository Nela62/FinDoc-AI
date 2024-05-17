create table if not exists public.settings (
  id uuid DEFAULT "gen_random_uuid"() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id),
  author_name text,
  company_name text
);

INSERT INTO
  settings (user_id, author_name, company_name)
SELECT
  id,
  'Coreline AI',
  'Coreline'
FROM
  auth.users;

alter table
  public.settings enable row level security;

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."settings" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

insert into
  storage.buckets(id, name, public)
values
  ('company-logos', 'company-logos', false);

CREATE POLICY "Give users access to SELECT own folder" ON storage.objects FOR
SELECT
  TO authenticated USING (
    bucket_id = 'company-logos'
    AND (
      select
        auth.uid() :: text
    ) = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to INSERT own folder" ON storage.objects FOR
INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'company-logos'
    AND (
      select
        auth.uid() :: text
    ) = (storage.foldername(name)) [1]
  );

CREATE POLICY "Give users access to DELETE own folder" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'company-logos'
  AND (
    select
      auth.uid() :: text
  ) = (storage.foldername(name)) [1]
);