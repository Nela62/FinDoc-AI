DROP policy "Give users authenticated access to folder 1b441y6_0" ON "storage"."objects";

CREATE policy "Give users authenticated access to folder sec-filings" ON "storage"."objects" AS permissive FOR
SELECT
  TO authenticated USING (
    (
      (bucket_id = 'sec-filings'::text)
    )
  );