ALTER TABLE public.subscriptions RENAME TO profiles;

ALTER TABLE public.profiles
  ADD COLUMN name text,
  ADD COLUMN email text,
  ADD COLUMN "role" text,
  ADD COLUMN "sec_filings_frequency" text;

UPDATE
  public.profiles
SET
  email = auth.users.email
FROM
  auth.users
WHERE
  public.profiles.id = auth.users.id;

-- Add the UNIQUE constraint
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Drop trigger
DROP TRIGGER on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION public.handle_new_user();

