CREATE TABLE IF NOT EXISTS public.subscriptions(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL
);

ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable SELECT for authenticated users based on user_id for subscriptions" ON "public"."subscriptions"
  FOR SELECT TO "authenticated"
    USING (((
      SELECT
        "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable INSERT for authenticated users based on user_id for subscriptions" ON "public"."subscriptions"
  FOR INSERT TO "authenticated"
    WITH CHECK (((
      SELECT
        "auth"."uid"() AS "uid") = "user_id"));

CREATE POLICY "Enable UPDATE for authenticated users based on user_id for subscriptions" ON "public"."subscriptions"
  FOR UPDATE TO "authenticated"
    USING (((
      SELECT
        "auth"."uid"() AS "uid") = "user_id"))
        WITH CHECK (((
          SELECT
            "auth"."uid"() AS "uid") = "user_id"));

-- Drop trigger
DROP TRIGGER on_auth_user_created ON auth.users;

-- Drop function
DROP FUNCTION public.handle_new_user();

-- inserts a row into public.subscriptions
CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = ''
  AS $$
BEGIN
  IF NOT EXISTS(
    SELECT
      1
    FROM
      public.settings
    WHERE
      user_id = NEW.id) THEN
  INSERT INTO public.settings(user_id, author_name, company_name)
    VALUES(NEW.id, 'Finpanel AI', 'Finpanel Inc.');
END IF;
  IF NOT EXISTS(
    SELECT
      1
    FROM
      public.subscriptions
    WHERE
      user_id = NEW.id) THEN
  INSERT INTO public.subscriptions(user_id, plan)
    VALUES(NEW.id, 'free');
END IF;
  RETURN new;
END;
$$;

-- trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

