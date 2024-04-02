create table reports {
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  company_ticker text not null,
  html text,
  json jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
}