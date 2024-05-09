ALTER TABLE
  "public"."citations" DROP CONSTRAINT "citations_report_id_fkey",
  DROP CONSTRAINT "citations_user_id_fkey";

DROP TABLE "public"."citations";

CREATE TABLE if not exists "public"."api_cache" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" "uuid" NOT NULL REFERENCES "auth"."users" ("id"),
  "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id"),
  "api_provider" text NOT NULL,
  "accessed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "json_data" jsonb NOT NULL,
  "endpoint" text NOT NULL
);

create table if not exists "public"."cited_documents" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" "uuid" NOT NULL REFERENCES "auth"."users" ("id"),
  "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id"),
  "source_num" integer NOT NULL,
  "top_title" text NOT NULL,
  "bottom_title" text,
  "citation_type" text NOT NULL,
  "doc_id" "uuid" REFERENCES "public"."documents" ("id"),
  "cache_id" "uuid" REFERENCES "public"."api_cache" ("id"),
  "last_refreshed" timestamp with time zone DEFAULT "now"() NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE if not exists "public"."citation_snippets" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" "uuid" NOT NULL REFERENCES "auth"."users" ("id"),
  "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id"),
  "cited_document_id" "uuid" NOT NULL REFERENCES "public"."cited_documents" ("id"),
  "source_num" integer NOT NULL,
  "title" text NOT NULL,
  "text_snippet" text NOT NULL,
  "last_refreshed" timestamp with time zone DEFAULT "now"() NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

-- TODO: may consider making citation_snippet_id unique
CREATE TABLE if not exists "public"."pdf_citations" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" "uuid" NOT NULL REFERENCES "auth"."users" ("id"),
  "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id"),
  "citation_snippet_id" "uuid" NOT NULL REFERENCES "public"."citation_snippets" ("id"),
  "node_id" text NOT NULL,
  "page" integer NOT NULL,
  "doc_id" "uuid" NOT NULL REFERENCES "public"."documents" ("id"),
  "text" text NOT NULL
);

CREATE TABLE if not exists "public"."api_citations" (
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "user_id" "uuid" NOT NULL REFERENCES "auth"."users" ("id"),
  "report_id" "uuid" NOT NULL REFERENCES "public"."reports" ("id"),
  "citation_snippet_id" "uuid" NOT NULL REFERENCES "public"."citation_snippets" ("id"),
  "cache_id" "uuid" NOT NULL REFERENCES "public"."api_cache" ("id"),
  "used_json_data" jsonb NOT NULL
);

-- CREATE TABLE "public"."news_citations" (
--   "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
--   "user_id": "uuid" NOT NULL REFERENCES "auth.users" ("id"),
--   "citation_snippet_id" "uuid" NOT NULL REFERENCES "public"."citation_snippets" ("id"),
-- );
ALTER TABLE
  "public"."cited_documents" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."api_cache" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."citation_snippets" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."pdf_citations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
  "public"."api_citations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."cited_documents" TO "authenticated" USING (
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

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."api_cache" TO "authenticated" USING (
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

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."citation_snippets" TO "authenticated" USING (
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

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."pdf_citations" TO "authenticated" USING (
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

CREATE POLICY "Enable ALL for authenticated users based on user_id" ON "public"."api_citations" TO "authenticated" USING (
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