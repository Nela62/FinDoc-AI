SET
  statement_timeout = 0;

SET
  lock_timeout = 0;

SET
  idle_in_transaction_session_timeout = 0;

SET
  client_encoding = 'UTF8';

SET
  standard_conforming_strings = on;

SELECT
  pg_catalog.set_config('search_path', '', false);

SET
  check_function_bodies = false;

SET
  xmloption = content;

SET
  client_min_messages = warning;

SET
  row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

CREATE SCHEMA IF NOT EXISTS "public";

ALTER SCHEMA "public" OWNER TO "pg_database_owner";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE SCHEMA IF NOT EXISTS "vecs";

ALTER SCHEMA "vecs" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

SET
  default_tablespace = '';

SET
  default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."citations" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "user_id" "uuid" NOT NULL,
  "node_id" "text",
  "text" "text" NOT NULL,
  "source_num" integer NOT NULL,
  "page" integer,
  "url" "text",
  "doc_id" "text",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "report_id" "uuid" NOT NULL
);

ALTER TABLE
  "public"."citations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."documents" (
  "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
  "url" "text" NOT NULL,
  "company_name" "text" NOT NULL,
  "company_ticker" "text" NOT NULL,
  "accession_number" "text",
  "doc_type" "text" NOT NULL,
  "year" integer NOT NULL,
  "quarter" "text",
  "created_at" timestamp with time zone DEFAULT "now"(),
  "updated_at" timestamp with time zone DEFAULT "now"(),
  "cik" "text" NOT NULL,
  "period_of_report_date" "date" NOT NULL,
  "filed_as_of_date" "date" NOT NULL,
  "date_as_of_change" "date" NOT NULL
);

ALTER TABLE
  "public"."documents" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."documents_reports" (
  "id" integer NOT NULL,
  "report_id" "uuid" NOT NULL,
  "document_id" "uuid" NOT NULL
);

ALTER TABLE
  "public"."documents_reports" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."documents_reports_id_seq" AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE
  "public"."documents_reports_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."documents_reports_id_seq" OWNED BY "public"."documents_reports"."id";

CREATE TABLE IF NOT EXISTS "public"."reports" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "user_id" "uuid" NOT NULL,
  "title" "text" NOT NULL,
  "company_ticker" "text" NOT NULL,
  "type" "text" NOT NULL,
  "recommendation" "text",
  "targetprice" double precision,
  "status" "text" NOT NULL,
  "html_content" "text",
  "json_content" "jsonb",
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "url" "text" NOT NULL
);

ALTER TABLE
  "public"."reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "vecs"."documents" (
  "id" character varying NOT NULL,
  "vec" "extensions"."vector"(1024) NOT NULL,
  "metadata" "jsonb" DEFAULT '{}' :: "jsonb" NOT NULL
);

ALTER TABLE
  "vecs"."documents" OWNER TO "postgres";

ALTER TABLE
  ONLY "public"."documents_reports"
ALTER COLUMN
  "id"
SET
  DEFAULT "nextval"(
    '"public"."documents_reports_id_seq"' :: "regclass"
  );

ALTER TABLE
  ONLY "public"."citations"
ADD
  CONSTRAINT "citations_pkey" PRIMARY KEY ("id");

ALTER TABLE
  ONLY "public"."documents"
ADD
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id");

ALTER TABLE
  ONLY "public"."documents_reports"
ADD
  CONSTRAINT "documents_reports_pkey" PRIMARY KEY ("id", "report_id", "document_id");

ALTER TABLE
  ONLY "public"."reports"
ADD
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id");

ALTER TABLE
  ONLY "public"."reports"
ADD
  CONSTRAINT "reports_url_key" UNIQUE ("url");

ALTER TABLE
  ONLY "vecs"."documents"
ADD
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id");

CREATE INDEX "idx_urls" ON "public"."documents" USING "btree" ("url");

CREATE INDEX "ix_vector_cosine_ops_hnsw_m16_efc64_fc4ea59" ON "vecs"."documents" USING "hnsw" ("vec" "extensions"."vector_cosine_ops") WITH ("m" = '16', "ef_construction" = '64');

ALTER TABLE
  ONLY "public"."citations"
ADD
  CONSTRAINT "citations_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE CASCADE;

ALTER TABLE
  ONLY "public"."citations"
ADD
  CONSTRAINT "citations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE
  ONLY "public"."documents_reports"
ADD
  CONSTRAINT "documents_reports_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id");

ALTER TABLE
  ONLY "public"."documents_reports"
ADD
  CONSTRAINT "documents_reports_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id");

ALTER TABLE
  ONLY "public"."reports"
ADD
  CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."citations" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."reports" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

CREATE POLICY "Enable all for users based on user_id" ON "public"."documents_reports" TO "authenticated" USING (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) IN (
      SELECT
        "reports"."user_id"
      FROM
        "public"."reports"
      WHERE
        ("reports"."id" = "documents_reports"."report_id")
    )
  )
) WITH CHECK (
  (
    (
      SELECT
        "auth"."uid"() AS "uid"
    ) IN (
      SELECT
        "reports"."user_id"
      FROM
        "public"."reports"
      WHERE
        ("reports"."id" = "documents_reports"."report_id")
    )
  )
);

CREATE POLICY "Enable select for authenticated users only" ON "public"."documents" FOR
SELECT
  TO "authenticated" USING (true);

ALTER TABLE
  "public"."citations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."documents" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."documents_reports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."reports" ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON TABLE "public"."citations" TO "anon";

GRANT ALL ON TABLE "public"."citations" TO "authenticated";

GRANT ALL ON TABLE "public"."citations" TO "service_role";

GRANT ALL ON TABLE "public"."documents" TO "anon";

GRANT ALL ON TABLE "public"."documents" TO "authenticated";

GRANT ALL ON TABLE "public"."documents" TO "service_role";

GRANT ALL ON TABLE "public"."documents_reports" TO "anon";

GRANT ALL ON TABLE "public"."documents_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."documents_reports" TO "service_role";

GRANT ALL ON SEQUENCE "public"."documents_reports_id_seq" TO "anon";

GRANT ALL ON SEQUENCE "public"."documents_reports_id_seq" TO "authenticated";

GRANT ALL ON SEQUENCE "public"."documents_reports_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."reports" TO "anon";

GRANT ALL ON TABLE "public"."reports" TO "authenticated";

GRANT ALL ON TABLE "public"."reports" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

RESET ALL;