DROP TABLE public.pdf_citations;

DROP TABLE public.api_citations;

DROP TABLE public.citation_snippets;

DROP TABLE public.cited_documents;

DROP TABLE public.documents_reports;

DROP TABLE public.documents;

CREATE TABLE IF NOT EXISTS public.sec_filings(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  ticker text NOT NULL,
  form text NOT NULL,
  accession_number text,
  cik text,
  year integer NOT NULL,
  quarter text,
  xml_path text NOT NULL,
  pdf_path text NOT NULL,
  "period_of_report_date" "date" NOT NULL,
  "filed_as_of_date" "date" NOT NULL,
  "date_as_of_change" "date" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"(),
  "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."sec_filings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for authenticated users only" ON "public"."sec_filings"
  FOR SELECT TO "authenticated"
    USING (TRUE);

-- First, delete all objects in the bucket
DELETE FROM storage.objects
WHERE bucket_id = 'sec-filings';

-- Then, delete the bucket itself
DELETE FROM storage.buckets
WHERE id = 'sec-filings';

INSERT INTO storage.buckets(id, name, public)
  VALUES ('sec-filings', 'sec-filings', FALSE);

CREATE POLICY "Give users access to SELECT sec filings" ON storage.objects
  FOR SELECT TO authenticated
    USING (bucket_id = 'sec-filings');

CREATE TABLE IF NOT EXISTS sec_jobs(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "ticker" text NOT NULL,
  "form" text NOT NULL,
  "status" text NOT NULL,
  "error" text,
  "progress" int4 DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "completed_at" timestamp with time zone
);

ALTER TABLE "public"."sec_jobs" ENABLE ROW LEVEL SECURITY;

