revoke delete on table "public"."placeholder" from "anon";

revoke insert on table "public"."placeholder" from "anon";

revoke references on table "public"."placeholder" from "anon";

revoke select on table "public"."placeholder" from "anon";

revoke trigger on table "public"."placeholder" from "anon";

revoke truncate on table "public"."placeholder" from "anon";

revoke update on table "public"."placeholder" from "anon";

revoke delete on table "public"."placeholder" from "authenticated";

revoke insert on table "public"."placeholder" from "authenticated";

revoke references on table "public"."placeholder" from "authenticated";

revoke select on table "public"."placeholder" from "authenticated";

revoke trigger on table "public"."placeholder" from "authenticated";

revoke truncate on table "public"."placeholder" from "authenticated";

revoke update on table "public"."placeholder" from "authenticated";

revoke delete on table "public"."placeholder" from "service_role";

revoke insert on table "public"."placeholder" from "service_role";

revoke references on table "public"."placeholder" from "service_role";

revoke select on table "public"."placeholder" from "service_role";

revoke trigger on table "public"."placeholder" from "service_role";

revoke truncate on table "public"."placeholder" from "service_role";

revoke update on table "public"."placeholder" from "service_role";

alter table "public"."placeholder" drop constraint "placeholder_pkey";

drop index if exists "public"."placeholder_pkey";

drop table "public"."placeholder";

create policy "Enable ALL for authenticated users based on user_id"
on "public"."reports"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



