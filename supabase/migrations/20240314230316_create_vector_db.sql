create table vector_store (
  id serial primary key,
  title text not null,
  body text not null,
  embedding vector(384)
);