-- drop all reports
DELETE FROM public.reports;

-- drop api cache table
DROP TABLE public.api_cache;

-- create new api cache table
CREATE TABLE IF NOT EXISTS public.metrics_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "ticker" text UNIQUE NOT NULL,
  "yf_annual" jsonb NOT NULL,
  "yf_quarterly" jsonb NOT NULL,
  "polygon_ttm" jsonb NOT NULL,
  "polygon_annual" jsonb NOT NULL,
  "polygon_quarterly" jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS public.api_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "report_id" uuid NOT NULL UNIQUE REFERENCES public.reports(id) ON DELETE CASCADE,
  "overview" jsonb NOT NULL,
  "stock" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.news_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "url" text UNIQUE NOT NULL,
  "content" text NOT NULL
);

ALTER TABLE "public"."metrics_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for authenticated users only" ON "public"."metrics_cache"
  FOR SELECT TO "authenticated"
    USING (TRUE);

ALTER TABLE "public"."news_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for authenticated users only" ON "public"."news_cache"
  FOR SELECT TO "authenticated"
    USING (TRUE);

ALTER TABLE "public"."api_cache" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for authenticated users based on user_id for api_cache" ON "public"."api_cache" TO "authenticated"
  USING (((
    SELECT
      "auth"."uid"() AS "uid") = "user_id"))
      WITH CHECK (((
        SELECT
          "auth"."uid"() AS "uid") = "user_id"));

ALTER TABLE public.reports RENAME COLUMN json_content TO tiptap_content;

ALTER TABLE public.reports
  ADD json_content jsonb;

