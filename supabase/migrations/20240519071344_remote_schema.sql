drop index if exists "vecs"."ix_vector_cosine_ops_hnsw_m16_efc64_4678dd5";

CREATE INDEX ix_vector_cosine_ops_hnsw_m16_efc64_a7c685d ON vecs.documents USING hnsw (vec vector_cosine_ops) WITH (m='16', ef_construction='64');


