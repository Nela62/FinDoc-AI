DROP TABLE companies;

CREATE TABLE IF NOT EXISTS public.companies(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "company_name" text NOT NULL,
  "stock_name" text NOT NULL,
  "ticker" text UNIQUE NOT NULL,
  "cik" text NOT NULL,
  "label" text NOT NULL GENERATED ALWAYS AS (ticker || ' - ' || stock_name) STORED,
  "website" text,
  "exchange" text,
  "currency" text,
  "country" text,
  "market_cap" text,
  "isin" text
);

ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable READ for authenticated users" ON "public"."companies" AS permissive
  FOR SELECT TO "authenticated"
    USING (TRUE);

ALTER TABLE public.reports
  ADD CONSTRAINT reports_ticker_fkey FOREIGN KEY (company_ticker) REFERENCES public.companies(ticker) ON DELETE CASCADE,
  ADD COLUMN section_ids text ARRAY NOT NULL;

