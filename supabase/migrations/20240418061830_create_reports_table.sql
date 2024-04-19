create table reports ( 
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) not null,
  title text not null,
  company_ticker text not null,
  type text not null,
  recommendation text,
  targetPrice float8,
  status text not null,
  html text,
  json jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null 
);

create table demo_reports ( 
  title text not null,
  company_ticker text not null,
  type text not null,
  recommendation text,
  targetPrice double precision,
  status text not null,
  html text,
  json jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null 
);