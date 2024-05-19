create policy "Give users authenticated access to folder 1b441y6_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'sec-filings'::text) AND ((storage.foldername(name))[1] = 'private'::text) AND (auth.role() = 'authenticated'::text)));


create policy "Give users authenticated access to public-documents"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'public-documents'::text) AND ((storage.foldername(name))[1] = 'private'::text) AND (auth.role() = 'authenticated'::text)));



