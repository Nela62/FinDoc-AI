alter table
  citation_snippets drop constraint citation_snippets_cited_document_id_fkey;

alter table
  citation_snippets
add
  constraint citation_snippets_cited_document_id_fkey foreign key (cited_document_id) references public.cited_documents (id) on delete cascade;

alter table
  pdf_citations drop constraint pdf_citations_citation_snippet_id_fkey;

alter table
  pdf_citations
add
  constraint pdf_citations_citation_snippet_id_fkey foreign key (citation_snippet_id) references public.citation_snippets (id) on delete cascade;

alter table
  api_citations drop constraint api_citations_citation_snippet_id_fkey;

alter table
  api_citations
add
  constraint api_citations_citation_snippet_id_fkey foreign key (citation_snippet_id) references public.citation_snippets (id) on delete cascade;