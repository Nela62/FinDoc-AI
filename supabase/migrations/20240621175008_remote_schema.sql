alter table "public"."report_template" drop constraint "report_template_report_id_fkey";

alter table "public"."report_template" add constraint "report_template_report_id_fkey" FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE not valid;

alter table "public"."report_template" validate constraint "report_template_report_id_fkey";


