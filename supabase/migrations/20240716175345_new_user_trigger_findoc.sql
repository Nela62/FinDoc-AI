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
    VALUES(NEW.id, 'Findoc AI', 'Findoc Inc.');
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
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

