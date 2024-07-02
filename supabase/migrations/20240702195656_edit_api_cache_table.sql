-- drop all reports
DELETE FROM public.reports;

-- drop api cache table
DROP TABLE public.api_cache;

-- create new api cache table
CREATE TABLE IF NOT EXISTS public.metric_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "ticker" text NOT NULL,
  "year" integer NOT NULL,
  "quarter" text,
  "data" jsonb NOT NULL,
  "type" text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.news_cache(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "url" text NOT NULL,
  "content" text NOT NULL
);

