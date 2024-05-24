create table if not exists public.companies (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "name" text not null,
  "symbol" text unique not null,
  "label" text not null generated always as (name || ' (' || symbol || ')') stored,
  "sector" text,
  "website" text,
  "industry_group" text,
  "exchange" text,
  "market" text,
  "country" text,
  "market_cap" text,
  "isin" text,
  "logo_link" text
);

ALTER TABLE
  "public"."companies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable READ for authenticated users" ON "public"."companies" as permissive for
SELECT
  TO "authenticated" using (true);

insert into
  storage.buckets(id, name, public)
values
  (
    'public-company-logos',
    'public-company-logos',
    false
  );

CREATE POLICY "Give users access to SELECT public company logos" ON storage.objects FOR
SELECT
  TO authenticated USING (bucket_id = 'public-company-logos');