-- Drop the existing primary key constraint
ALTER TABLE public.profiles
  DROP COLUMN id;

ALTER TABLE public.profiles
  ADD PRIMARY KEY (user_id);

