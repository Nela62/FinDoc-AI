alter table "public"."demo_reports" drop column "html";

alter table "public"."demo_reports" drop column "json";

alter table "public"."demo_reports" drop column "targetprice";

alter table "public"."demo_reports" add column "html_content" text;

alter table "public"."demo_reports" add column "id" uuid not null default gen_random_uuid();

alter table "public"."demo_reports" add column "json_content" json;

alter table "public"."demo_reports" add column "target_price" double precision;

alter table "public"."demo_reports" alter column "url" set not null;

CREATE UNIQUE INDEX demo_reports_pkey ON public.demo_reports USING btree (id);

alter table "public"."demo_reports" add constraint "demo_reports_pkey" PRIMARY KEY using index "demo_reports_pkey";


