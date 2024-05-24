create table if not exists public.companies (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "name" text not null,
  "symbol" text unique not null,
  "label" text generated always as (name || ' (' || symbol || ')') stored,
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

CREATE POLICY "Enable READ for authenticated users based on user_id" ON "public"."cited_documents" as permissive for
SELECT
  TO "authenticated" USING (
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
  (
    'public-company-logos',
    'public-company-logos',
    false
  );

CREATE POLICY "Give users access to SELECT public company logos" ON storage.objects FOR
SELECT
  TO authenticated USING (bucket_id = 'public-company-logos');