ALTER TABLE "public"."report_template"
  DROP CONSTRAINT "report_template_report_id_fkey";

ALTER TABLE "public"."report_template"
  ADD CONSTRAINT "report_template_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."report_template" validate CONSTRAINT "report_template_report_id_fkey";

