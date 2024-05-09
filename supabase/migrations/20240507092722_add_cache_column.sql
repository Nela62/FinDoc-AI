alter table
  "public"."api_cache"
add
  column "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id");

alter table
  "public"."api_citations"
add
  column "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id");

alter table
  "public"."cited_documents"
add
  column "cache_id" "uuid" REFERENCES "public"."api_cache" ("id");

-- alter table
--   "public"."api_citations"
-- add
--   constraint "api_citations_citation_snippet_id_fkey" FOREIGN KEY (citation_snippet_id) REFERENCES citation_snippets(id);
alter table
  "public"."api_citations" validate constraint "api_citations_citation_snippet_id_fkey";

-- alter table
--   "public"."citation_snippets"
-- add
--   constraint "citation_snippets_cited_document_id_fkey" FOREIGN KEY (cited_document_id) REFERENCES cited_documents(id);
alter table
  "public"."citation_snippets" validate constraint "citation_snippets_cited_document_id_fkey";

-- alter table
--   "public"."pdf_citations"
-- add
--   constraint "pdf_citations_citation_snippet_id_fkey" FOREIGN KEY (citation_snippet_id) REFERENCES citation_snippets(id);
alter table
  "public"."pdf_citations" validate constraint "pdf_citations_citation_snippet_id_fkey";