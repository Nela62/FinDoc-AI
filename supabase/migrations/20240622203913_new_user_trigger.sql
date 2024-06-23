-- inserts a row into public.profiles
CREATE FUNCTION public.handle_new_user() RETURNS trigger language plpgsql SECURITY DEFINER
SET
  search_path = '' 
AS $$ 
BEGIN
INSERT INTO
  public.settings (user_id, author_name, company_name)
VALUES
  (
    new.id,
    'Finpanel AI',
    'Finpanel Inc.'
  );

RETURN new;
END;
$$;

-- trigger the function every time a user is created
CREATE trigger on_auth_user_created
AFTER
INSERT
  ON auth.users FOR each ROW EXECUTE PROCEDURE public.handle_new_user();