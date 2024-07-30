ALTER TABLE public.subscriptions RENAME TO profiles;

ALTER TABLE public.profiles
  ADD COLUMN name text,
  ADD COLUMN "role" text,
  ADD COLUMN "sec_filings_frequency" text;

