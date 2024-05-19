alter table "public"."api_cache" drop constraint "api_cache_report_id_fkey";

alter table "public"."api_cache" drop constraint "api_cache_user_id_fkey";

alter table "public"."api_citations" drop constraint "api_citations_cache_id_fkey";

alter table "public"."api_citations" drop constraint "api_citations_report_id_fkey";

alter table "public"."api_citations" drop constraint "api_citations_user_id_fkey";

alter table "public"."citation_snippets" drop constraint "citation_snippets_report_id_fkey";

alter table "public"."citation_snippets" drop constraint "citation_snippets_user_id_fkey";

alter table "public"."cited_documents" drop constraint "cited_documents_cache_id_fkey";

alter table "public"."cited_documents" drop constraint "cited_documents_doc_id_fkey";

alter table "public"."cited_documents" drop constraint "cited_documents_report_id_fkey";

alter table "public"."cited_documents" drop constraint "cited_documents_user_id_fkey";

alter table "public"."pdf_citations" drop constraint "pdf_citations_doc_id_fkey";

alter table "public"."pdf_citations" drop constraint "pdf_citations_report_id_fkey";

alter table "public"."pdf_citations" drop constraint "pdf_citations_user_id_fkey";

alter table "public"."api_cache" add constraint "api_cache_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."api_cache" validate constraint "api_cache_report_id_fkey";

alter table "public"."api_cache" add constraint "api_cache_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."api_cache" validate constraint "api_cache_user_id_fkey";

alter table "public"."api_citations" add constraint "api_citations_cache_id_fkey" FOREIGN KEY (cache_id) REFERENCES api_cache(id) ON DELETE CASCADE not valid;

alter table "public"."api_citations" validate constraint "api_citations_cache_id_fkey";

alter table "public"."api_citations" add constraint "api_citations_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."api_citations" validate constraint "api_citations_report_id_fkey";

alter table "public"."api_citations" add constraint "api_citations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."api_citations" validate constraint "api_citations_user_id_fkey";

alter table "public"."citation_snippets" add constraint "citation_snippets_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."citation_snippets" validate constraint "citation_snippets_report_id_fkey";

alter table "public"."citation_snippets" add constraint "citation_snippets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."citation_snippets" validate constraint "citation_snippets_user_id_fkey";

alter table "public"."cited_documents" add constraint "cited_documents_cache_id_fkey" FOREIGN KEY (cache_id) REFERENCES api_cache(id) ON DELETE CASCADE not valid;

alter table "public"."cited_documents" validate constraint "cited_documents_cache_id_fkey";

alter table "public"."cited_documents" add constraint "cited_documents_doc_id_fkey" FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."cited_documents" validate constraint "cited_documents_doc_id_fkey";

alter table "public"."cited_documents" add constraint "cited_documents_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."cited_documents" validate constraint "cited_documents_report_id_fkey";

alter table "public"."cited_documents" add constraint "cited_documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."cited_documents" validate constraint "cited_documents_user_id_fkey";

alter table "public"."pdf_citations" add constraint "pdf_citations_doc_id_fkey" FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE not valid;

alter table "public"."pdf_citations" validate constraint "pdf_citations_doc_id_fkey";

alter table "public"."pdf_citations" add constraint "pdf_citations_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."pdf_citations" validate constraint "pdf_citations_report_id_fkey";

alter table "public"."pdf_citations" add constraint "pdf_citations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."pdf_citations" validate constraint "pdf_citations_user_id_fkey";


