drop table companies;

create table if not exists public.companies (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "company_name" text not null,
  "stock_name" text not null,
  "ticker" text unique not null,
  "cik" text not null,
  "label" text not null generated always as (ticker || ' - ' || stock_name) stored,
  "website" text,
  "exchange" text,
  "currency" text,
  "country" text,
  "market_cap" text,
  "isin" text
);

ALTER TABLE
  "public"."companies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable READ for authenticated users" ON "public"."companies" as permissive for
SELECT
  TO "authenticated" using (true);

alter table
  public.reports
add
  constraint reports_ticker_fkey foreign key (company_ticker) references public.companies (ticker) on delete cascade,
add
  column section_ids text array not null;