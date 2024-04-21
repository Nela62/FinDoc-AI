alter table "public"."demo_citations" drop constraint "demo_citations_report_id_fkey";

alter table "public"."demo_citations" alter column "report_id" set data type text using "report_id"::text;

alter table "public"."documents" drop column "embedding";


