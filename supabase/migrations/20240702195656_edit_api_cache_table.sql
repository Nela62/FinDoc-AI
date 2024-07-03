-- drop all reports
DELETE FROM public.reports;

-- drop api cache table
DROP TABLE public.api_cache;

-- create new api cache table
CREATE TABLE IF NOT EXISTS public.metrics_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "ticker" text NOT NULL,
  "timescale" text NOT NULL,
  "data" jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS public.news_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "url" text NOT NULL,
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

