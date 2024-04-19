alter table "public"."demo_reports" add column "url" text;

alter table "public"."demo_reports" enable row level security;

alter table "public"."reports" enable row level security;

create policy "Enable select for authenticated users only"
on "public"."demo_reports"
as permissive
for select
to authenticated
using (true);


create policy "Enable select for authenticated users only"
on "public"."documents"
as permissive
for select
to authenticated
using (true);



