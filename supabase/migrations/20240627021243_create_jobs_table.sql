CREATE TABLE IF NOT EXISTS ai_jobs(
  "id" "uuid" DEFAULT "gen_random_uuid"() PRIMARY KEY,
  "block_id" text NOT NULL,
  "status" text NOT NULL,
  "block_data" text,
  "input_tokens" int4,
  "output_tokens" int4,
  "error" text,
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "finished_at" timestamp with time zone
);

ALTER TABLE "public"."ai_jobs" ENABLE ROW LEVEL SECURITY;

