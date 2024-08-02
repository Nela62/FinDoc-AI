-- Drop the existing primary key constraint
ALTER TABLE public.settings
  DROP COLUMN id;

ALTER TABLE public.settings
  ADD PRIMARY KEY (user_id);

