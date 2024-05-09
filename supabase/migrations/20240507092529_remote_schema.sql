alter table "public"."api_cache" drop constraint "api_cache_report_id_fkey";

alter table "public"."api_citations" drop constraint "api_citations_report_id_fkey";

alter table "public"."cited_documents" drop constraint "cited_documents_cache_id_fkey";

alter table "public"."api_citations" drop constraint "api_citations_citation_snippet_id_fkey";

alter table "public"."citation_snippets" drop constraint "citation_snippets_cited_document_id_fkey";

alter table "public"."pdf_citations" drop constraint "pdf_citations_citation_snippet_id_fkey";

alter table "public"."api_cache" drop column "report_id";

alter table "public"."api_citations" drop column "report_id";

alter table "public"."cited_documents" drop column "cache_id";

alter table "public"."api_citations" add constraint "api_citations_citation_snippet_id_fkey" FOREIGN KEY (citation_snippet_id) REFERENCES citation_snippets(id) not valid;

alter table "public"."api_citations" validate constraint "api_citations_citation_snippet_id_fkey";

alter table "public"."citation_snippets" add constraint "citation_snippets_cited_document_id_fkey" FOREIGN KEY (cited_document_id) REFERENCES cited_documents(id) not valid;

alter table "public"."citation_snippets" validate constraint "citation_snippets_cited_document_id_fkey";

alter table "public"."pdf_citations" add constraint "pdf_citations_citation_snippet_id_fkey" FOREIGN KEY (citation_snippet_id) REFERENCES citation_snippets(id) not valid;

alter table "public"."pdf_citations" validate constraint "pdf_citations_citation_snippet_id_fkey";


drop index if exists "vecs"."ix_vector_cosine_ops_hnsw_m16_efc64_fc4ea59";

CREATE INDEX ix_vector_cosine_ops_hnsw_m16_efc64_4678dd5 ON vecs.documents USING hnsw (vec vector_cosine_ops) WITH (m='16', ef_construction='64');


