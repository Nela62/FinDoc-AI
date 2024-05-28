create table if not exists public.report_template (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  report_id uuid not null references public.reports (id),
  user_id uuid not null references auth.users (id),
  template_type text not null,
  business_description text,
  summary text array,
  color_scheme text array,
  author_name text,
  metrics jsonb
);

ALTER TABLE
  "public"."report_template" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."report_template" TO "authenticated" USING (
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

alter table
  public.reports
add
  column financial_strength text,
add
  column company_name text,
add
  column company_logo text;