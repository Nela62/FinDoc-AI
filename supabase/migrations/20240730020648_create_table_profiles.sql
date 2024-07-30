ALTER TABLE public.subscriptions RENAME TO profiles;

ALTER TABLE public.profiles
  ADD COLUMN name text,
  ADD COLUMN email text UNIQUE NOT NULL,
  ADD COLUMN "role" text,
  ADD COLUMN "sec_filings_frequency" text;

-- Drop trigger
DROP TRIGGER on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION public.handle_new_user();

