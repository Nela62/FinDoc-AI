alter table "public"."report_template" drop constraint "report_template_user_id_fkey";

alter table "public"."reports" drop constraint "reports_user_id_fkey";

alter table "public"."settings" drop constraint "settings_user_id_fkey";

alter table "public"."settings" drop constraint "settings_pkey";

drop index if exists "public"."settings_pkey";

alter table "public"."settings" drop column "id";

CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (user_id);

alter table "public"."settings" add constraint "settings_pkey" PRIMARY KEY using index "settings_pkey";

alter table "public"."report_template" add constraint "report_template_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."report_template" validate constraint "report_template_user_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

alter table "public"."settings" add constraint "settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."settings" validate constraint "settings_user_id_fkey";


