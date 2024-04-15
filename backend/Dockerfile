# https://hub.docker.com/_/python
FROM python:3.11.3-slim-bullseye as requirements-stage

ENV PYTHONUNBUFFERED True

RUN apt-get update
RUN apt-get install libpq-dev gcc build-essential wkhtmltopdf  -y

WORKDIR /tmp

RUN pip install poetry

COPY ./pyproject.toml ./poetry.lock* ./

RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM python:3.11.3-slim-bullseye

WORKDIR /code

COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app


ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG OPENAI_API_KEY
ENV OPENAI_API_KEY=$OPENAI_API_KEY

ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

ARG VOYAGE_API_KEY
ENV VOYAGE_API_KEY=$VOYAGE_API_KEY

ARG SUPABASE_URL
ENV SUPABASE_URL=$SUPABASE_URL

ARG SUPABASE_KEY
ENV SUPABASE_KEY=$SUPABASE_KEY

ARG SERVICE_SUPABASE_KEY
ENV SERVICE_SUPABASE_KEY=$SERVICE_SUPABASE_KEY

ARG COHERE_API_KEY
ENV COHERE_API_KEY=$COHERE_API_KEY

ARG BACKEND_CORS_ORIGINS
ENV BACKEND_CORS_ORIGINS=$BACKEND_CORS_ORIGINS

# FROM base as runtime

# COPY --from=builder ${VIRTUAL_ENV} ${VIRTUAL_ENV}
# EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port 8000
# CMD [ "uvicorn", "app.main:start", "--host", "0.0.0.0",]
# CMD ["poetry", "run", "start"]
# CMD ["gunicorn", "-w", "2", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]

