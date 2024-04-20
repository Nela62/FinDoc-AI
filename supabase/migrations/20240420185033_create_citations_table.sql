create table citations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) not null,
  report_id uuid references reports (id) not null,
  node_id text,
  text text not null,
  source_num int not null,
  page int4,
  url text,
  doc_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table demo_citations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports (id) not null,
  node_id text,
  text text not null,
  source_num int not null,
  page int4,
  url text,
  doc_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table
  citations enable row level security;

-- RLS for the "citations" table
CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."citations" FOR
ALL
  TO authenticated USING (
    (select auth.uid()) = user_id
  )
  WITH CHECK (
    (select auth.uid()) = user_id
  );

alter table
  demo_citations enable row level security;

-- RLS for the "citations" table
CREATE POLICY "Enable SELECT for authenticated users based on user_id" ON "public"."demo_citations" FOR SELECT TO authenticated;