drop policy "Enable SELECT for authenticated users based on user_id" on "public"."demo_citations";

create policy "Enable SELECT for authenticated users"
on "public"."demo_citations"
as permissive
for select
to authenticated;



