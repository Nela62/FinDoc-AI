create extension if not exists vector;

create extension if not exists "uuid-ossp";

create table documents (
  id uuid default uuid_generate_v4(),
  url text not null,
  company_name text not null,
  company_ticker text not null,
  accession_number text,
  doc_type text not null,
  year integer not null,
  quarter integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  cik text not null,
  period_of_report_date date not null,
  filed_as_of_date date not null,
  date_as_of_change date not null,
  primary key (id)
);

alter table
  documents enable row level security;

create index idx_urls on documents (url);

-- RLS for the "public-documents" bucket
CREATE POLICY "Give users authenticated access to public-documents" ON storage.objects FOR
SELECT
  TO public USING (
    bucket_id = 'public-documents'
    AND (storage.foldername(name)) [1] = 'private'
    AND auth.role() = 'authenticated'
  );