drop policy "Enable SELECT for authenticated users" on "public"."demo_citations";

create table "public"."demo_documents_reports" (
    "document_id" uuid,
    "report_url" text
);


alter table "public"."demo_documents_reports" enable row level security;

create table "public"."documents_reports" (
    "id" uuid not null default gen_random_uuid(),
    "document_id" uuid,
    "report_url" text
);


alter table "public"."demo_citations" drop column "report_id";

alter table "public"."demo_citations" add column "report_url" text not null;

alter table "public"."demo_citations" alter column "node_id" set not null;

alter table "public"."reports" add column "url" text not null;

CREATE UNIQUE INDEX demo_citations_node_id_key ON public.demo_citations USING btree (node_id);

CREATE UNIQUE INDEX demo_reports_url_key ON public.demo_reports USING btree (url);

CREATE UNIQUE INDEX documents_reports_pkey ON public.documents_reports USING btree (id);

CREATE UNIQUE INDEX reports_url_key ON public.reports USING btree (url);

alter table "public"."documents_reports" add constraint "documents_reports_pkey" PRIMARY KEY using index "documents_reports_pkey";

alter table "public"."demo_citations" add constraint "demo_citations_node_id_key" UNIQUE using index "demo_citations_node_id_key";

alter table "public"."demo_citations" add constraint "public_demo_citations_report_url_fkey" FOREIGN KEY (report_url) REFERENCES demo_reports(url) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."demo_citations" validate constraint "public_demo_citations_report_url_fkey";

alter table "public"."demo_documents_reports" add constraint "demo_documents_reports_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."demo_documents_reports" validate constraint "demo_documents_reports_document_id_fkey";

alter table "public"."demo_documents_reports" add constraint "demo_documents_reports_report_url_fkey" FOREIGN KEY (report_url) REFERENCES demo_reports(url) ON DELETE CASCADE not valid;

alter table "public"."demo_documents_reports" validate constraint "demo_documents_reports_report_url_fkey";

alter table "public"."demo_reports" add constraint "demo_reports_url_key" UNIQUE using index "demo_reports_url_key";

alter table "public"."documents_reports" add constraint "documents_reports_document_id_fkey" FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."documents_reports" validate constraint "documents_reports_document_id_fkey";

alter table "public"."documents_reports" add constraint "documents_reports_report_url_fkey" FOREIGN KEY (report_url) REFERENCES reports(url) ON DELETE CASCADE not valid;

alter table "public"."documents_reports" validate constraint "documents_reports_report_url_fkey";

alter table "public"."reports" add constraint "reports_url_key" UNIQUE using index "reports_url_key";

grant delete on table "public"."demo_documents_reports" to "anon";

grant insert on table "public"."demo_documents_reports" to "anon";

grant references on table "public"."demo_documents_reports" to "anon";

grant select on table "public"."demo_documents_reports" to "anon";

grant trigger on table "public"."demo_documents_reports" to "anon";

grant truncate on table "public"."demo_documents_reports" to "anon";

grant update on table "public"."demo_documents_reports" to "anon";

grant delete on table "public"."demo_documents_reports" to "authenticated";

grant insert on table "public"."demo_documents_reports" to "authenticated";

grant references on table "public"."demo_documents_reports" to "authenticated";

grant select on table "public"."demo_documents_reports" to "authenticated";

grant trigger on table "public"."demo_documents_reports" to "authenticated";

grant truncate on table "public"."demo_documents_reports" to "authenticated";

grant update on table "public"."demo_documents_reports" to "authenticated";

grant delete on table "public"."demo_documents_reports" to "service_role";

grant insert on table "public"."demo_documents_reports" to "service_role";

grant references on table "public"."demo_documents_reports" to "service_role";

grant select on table "public"."demo_documents_reports" to "service_role";

grant trigger on table "public"."demo_documents_reports" to "service_role";

grant truncate on table "public"."demo_documents_reports" to "service_role";

grant update on table "public"."demo_documents_reports" to "service_role";

grant delete on table "public"."documents_reports" to "anon";

grant insert on table "public"."documents_reports" to "anon";

grant references on table "public"."documents_reports" to "anon";

grant select on table "public"."documents_reports" to "anon";

grant trigger on table "public"."documents_reports" to "anon";

grant truncate on table "public"."documents_reports" to "anon";

grant update on table "public"."documents_reports" to "anon";

grant delete on table "public"."documents_reports" to "authenticated";

grant insert on table "public"."documents_reports" to "authenticated";

grant references on table "public"."documents_reports" to "authenticated";

grant select on table "public"."documents_reports" to "authenticated";

grant trigger on table "public"."documents_reports" to "authenticated";

grant truncate on table "public"."documents_reports" to "authenticated";

grant update on table "public"."documents_reports" to "authenticated";

grant delete on table "public"."documents_reports" to "service_role";

grant insert on table "public"."documents_reports" to "service_role";

grant references on table "public"."documents_reports" to "service_role";

grant select on table "public"."documents_reports" to "service_role";

grant trigger on table "public"."documents_reports" to "service_role";

grant truncate on table "public"."documents_reports" to "service_role";

grant update on table "public"."documents_reports" to "service_role";

create policy "Enable read access for authenticated users"
on "public"."demo_citations"
as permissive
for select
to authenticated
using (true);


create policy "Enable select for authenticated users only"
on "public"."demo_documents_reports"
as permissive
for select
to authenticated
using (true);



